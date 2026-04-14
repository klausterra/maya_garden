"""Motor Central de Agendamento (Coordinator) para o Maya Garden."""
import asyncio
import logging
from datetime import datetime, timedelta

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_interval

_LOGGER = logging.getLogger(__name__)

class MayaGardenCoordinator:
    """Gerencia a verificacao de horarios e execucao da irrigacao."""

    def __init__(self, hass: HomeAssistant, config_entry):
        self.hass = hass
        self.config_entry = config_entry
        self.pump_entity = config_entry.data.get("pump_entity")
        self.valve_entities = config_entry.data.get("valve_entities", [])
        self.rain_sensor = config_entry.data.get("rain_sensor")
        self._active_irrigation_tasks = {}
        self._last_triggered = {}  # Evitar duplo disparo

    async def async_setup(self):
        """Inicia o monitoramento a cada 30 segundos para nao perder janela."""
        async_track_time_interval(self.hass, self.async_check_schedules, timedelta(seconds=30))
        _LOGGER.warning("Maya Garden: Motor de agendamento iniciado (intervalo: 30s).")

    def _find_entity(self, pattern_parts):
        """Busca uma entidade pelo padrao, tolerando prefixos do device."""
        for entity_id in self.hass.states.async_entity_ids():
            if all(part in entity_id for part in pattern_parts):
                return entity_id
        return None

    async def async_check_schedules(self, _now=None):
        """Verifica se algum horario bate com o momento atual."""
        now = datetime.now()
        current_time = now.strftime("%H:%M")

        for idx, valve_entity in enumerate(self.valve_entities):
            zone_id = idx + 1

            # 1. Verificar Modo da Zona
            mode_entity = self._find_entity(["select.", f"modo_zona_{zone_id}"])
            if not mode_entity:
                continue
            mode = self.hass.states.get(mode_entity)
            if not mode or mode.state == "Desligado":
                continue

            # 2. Verificar Pausa Manual / Chuva
            pause_entity = self._find_entity(["switch.", f"zona_{zone_id}", "chuva"])
            if not pause_entity:
                pause_entity = self._find_entity(["switch.", "pausa", f"zona_{zone_id}"])
            if pause_entity:
                pause = self.hass.states.get(pause_entity)
                if pause and pause.state == "on":
                    continue

            # 3. Sensor de Chuva (modo Automatico)
            if "utom" in (mode.state or "") and self.rain_sensor:
                rain_state = self.hass.states.get(self.rain_sensor)
                if rain_state and rain_state.state in ("on", "unavailable"):
                    continue

            # 4. Verificar os 4 horarios
            for s in range(1, 5):
                active_ent = self._find_entity(["switch.", f"zona_{zone_id}", f"horario_{s}", "ativo"])
                if not active_ent:
                    continue
                active = self.hass.states.get(active_ent)
                if not active or active.state != "on":
                    continue

                time_ent = self._find_entity(["time.", f"zona_{zone_id}", f"horario_{s}"])
                if not time_ent:
                    continue
                scheduled = self.hass.states.get(time_ent)
                if not scheduled:
                    continue

                scheduled_hhmm = scheduled.state[:5]
                if scheduled_hhmm != current_time:
                    continue

                # Evitar duplo disparo no mesmo minuto
                trigger_key = f"z{zone_id}_h{s}_{current_time}"
                if trigger_key in self._last_triggered:
                    continue

                # Se ja estiver irrigando esta zona, nao dispara de novo
                if zone_id in self._active_irrigation_tasks:
                    continue

                # Duracao
                dur_ent = self._find_entity(["number.", f"zona_{zone_id}", f"horario_{s}", "duracao"])
                duration = 5.0
                if dur_ent:
                    dur_state = self.hass.states.get(dur_ent)
                    if dur_state:
                        try:
                            duration = float(dur_state.state)
                        except:
                            pass

                self._last_triggered[trigger_key] = True
                _LOGGER.warning("Maya Garden: DISPARANDO Zona %s, Horario %s (%s), Duracao %s min",
                              zone_id, s, scheduled_hhmm, duration)
                self.hass.async_create_task(
                    self.async_run_irrigation(zone_id, valve_entity, duration)
                )
                break

        # Limpar triggers antigos (manter apenas do minuto atual)
        old_keys = [k for k in self._last_triggered if not k.endswith(f"_{current_time}")]
        for k in old_keys:
            del self._last_triggered[k]

    async def async_run_irrigation(self, zone_id, valve_entity, duration_min):
        """Executa a irrigacao: liga bomba+valvula, espera, desliga."""
        try:
            self._active_irrigation_tasks[zone_id] = True
            _LOGGER.warning("Maya Garden: Ligando Zona %s por %s min (bomba=%s, valvula=%s)",
                          zone_id, duration_min, self.pump_entity, valve_entity)

            await self.hass.services.async_call(
                "switch", "turn_on",
                {"entity_id": [self.pump_entity, valve_entity]}
            )
            await asyncio.sleep(duration_min * 60)
            await self.hass.services.async_call(
                "switch", "turn_off",
                {"entity_id": valve_entity}
            )

            await asyncio.sleep(2)
            if len(self._active_irrigation_tasks) <= 1:
                await self.hass.services.async_call(
                    "switch", "turn_off",
                    {"entity_id": self.pump_entity}
                )
                _LOGGER.warning("Maya Garden: Zona %s finalizada. Bomba desligada.", zone_id)
            else:
                _LOGGER.warning("Maya Garden: Zona %s finalizada. Bomba mantida (outra zona ativa).", zone_id)
        except Exception as err:
            _LOGGER.error("Maya Garden: Erro na irrigacao Zona %s: %s", zone_id, err)
        finally:
            self._active_irrigation_tasks.pop(zone_id, None)
