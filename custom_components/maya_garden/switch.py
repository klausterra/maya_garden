"""Controle de Ativacao (Switch) para o Maya Garden."""
from homeassistant.components.switch import SwitchEntity
from homeassistant.helpers.restore_state import RestoreEntity
from .const import DOMAIN

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Configura os botoes de ativacao dinamicos."""
    valves = config_entry.data.get("valve_entities", [])
    entities = []
    for idx, valve in enumerate(valves):
        zone_id = idx + 1
        for schedule_id in range(1, 5):
            entities.append(MayaGardenScheduleSwitch(zone_id, schedule_id, config_entry.entry_id))
        entities.append(MayaGardenPauseSwitch(zone_id, config_entry.entry_id))
    async_add_entities(entities)

class MayaGardenScheduleSwitch(SwitchEntity, RestoreEntity):
    """Representacao dinamica de input_boolean de horario."""
    def __init__(self, zone_id, schedule_id, entry_id):
        self._zone_id = zone_id
        self._schedule_id = schedule_id
        self._attr_name = f"Zona {zone_id} - Horario {schedule_id} Ativo"
        self._attr_unique_id = f"{entry_id}_maya_garden_zona_{zone_id}_horario_{schedule_id}_ativo"
        self._attr_icon = "mdi:clock-check-outline"
        self._is_on = False
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry_id)},
            "name": "Sistema de Irrigacao",
            "manufacturer": "Maya",
            "model": "Garden v1.0",
        }
    @property
    def is_on(self):
        """Estado do Switch."""
        return self._is_on
    async def async_turn_on(self, **kwargs):
        """Ligar o switch."""
        self._is_on = True
        self.async_write_ha_state()
    async def async_turn_off(self, **kwargs):
        """Desligar o switch."""
        self._is_on = False
        self.async_write_ha_state()
    async def async_added_to_hass(self):
        """Restaurar estado."""
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state and state.state == "on":
            self._is_on = True

class MayaGardenPauseSwitch(SwitchEntity, RestoreEntity):
    """Botao para pausar a zona manualmente (Pausa Chuva)."""
    def __init__(self, zone_id, entry_id):
        self._zone_id = zone_id
        self._attr_name = f"Pausar Zona {zone_id} por Chuva"
        self._attr_unique_id = f"{entry_id}_maya_garden_zona_{zone_id}_pausa_chuva"
        self._attr_icon = "mdi:weather-rainy"
        self._is_on = False
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry_id)},
            "name": "Sistema de Irrigacao",
            "manufacturer": "Maya",
            "model": "Garden v1.0",
        }
    @property
    def is_on(self):
        return self._is_on
    async def async_turn_on(self, **kwargs):
        self._is_on = True
        self.async_write_ha_state()
    async def async_turn_off(self, **kwargs):
        self._is_on = False
        self.async_write_ha_state()
    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state and state.state == "on":
            self._is_on = True
