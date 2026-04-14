"""Seletor de Hora (Time) para o Maya Garden."""
from datetime import time
from homeassistant.components.time import TimeEntity
from homeassistant.helpers.restore_state import RestoreEntity
from .const import DOMAIN

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Configura os campos de horários dinâmicos."""
    valves = config_entry.data.get("valve_entities", [])
    entities = []
    
    for idx, valve in enumerate(valves):
        zone_id = idx + 1
        for schedule_id in range(1, 5):
            entities.append(MayaGardenTime(zone_id, schedule_id, config_entry.entry_id))
            
    async_add_entities(entities)

class MayaGardenTime(TimeEntity, RestoreEntity):
    """Representação dinâmica de input_datetime (Somente hora)."""

    def __init__(self, zone_id, schedule_id, entry_id):
        self._zone_id = zone_id
        self._schedule_id = schedule_id
        self._attr_name = f"Zona {zone_id} - Horário {schedule_id}"
        self._attr_unique_id = f"{entry_id}_maya_garden_zona_{zone_id}_horario_{schedule_id}"
        self._attr_icon = "mdi:clock-outline"
        # Inicia com intervalos básicos (6h, 12h, 18h, 22h)
        default_hours = {1: 6, 2: 12, 3: 18, 4: 22}
        self._state = time(default_hours.get(schedule_id, 6), 0)

        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry_id)},
            "name": "Sistema de Irrigação",
            "manufacturer": "Maya",
            "model": "Garden v1.0",
        }

    @property
    def native_value(self) -> time:
        """Hora selecionada."""
        return self._state

    async def async_set_value(self, value: time) -> None:
        """Usuário mudou a hora no Dashboard."""
        self._state = value
        self.async_write_ha_state()

    async def async_added_to_hass(self):
        """Restaurar estado."""
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state and state.state:
            try:
                parts = state.state.split(":")
                self._state = time(int(parts[0]), int(parts[1]))
            except (ValueError, IndexError):
                pass
