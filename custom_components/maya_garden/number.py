"""Seletor de Duracao (Number) para o Maya Garden."""
from homeassistant.components.number import NumberEntity
from homeassistant.helpers.restore_state import RestoreEntity
from .const import DOMAIN

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Configura as caixas numericas dinamicamente."""
    valves = config_entry.data.get("valve_entities", [])
    entities = []
    for idx, valve in enumerate(valves):
        zone_id = idx + 1
        for schedule_id in range(1, 5):
            entities.append(MayaGardenDuration(zone_id, schedule_id, config_entry.entry_id))
    async_add_entities(entities)

class MayaGardenDuration(NumberEntity, RestoreEntity):
    """Representacao dinamica de input_number (Duracao)."""
    def __init__(self, zone_id, schedule_id, entry_id):
        self._zone_id = zone_id
        self._schedule_id = schedule_id
        self._attr_name = f"Zona {zone_id} - Horario {schedule_id} - Duracao"
        self._attr_unique_id = f"{entry_id}_maya_garden_zona_{zone_id}_duracao_{schedule_id}"
        self._attr_icon = "mdi:timer-outline"
        self._attr_native_min_value = 1
        self._attr_native_max_value = 10
        self._attr_native_step = 1
        self._attr_native_unit_of_measurement = "min"
        self._state = 5.0
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry_id)},
            "name": "Sistema de Irrigacao",
            "manufacturer": "Maya",
            "model": "Garden v1.0",
        }
    @property
    def native_value(self) -> float:
        return self._state
    async def async_set_native_value(self, value: float) -> None:
        self._state = value
        self.async_write_ha_state()
    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state and state.state:
            try:
                self._state = min(float(state.state), 10.0)
            except ValueError:
                pass
