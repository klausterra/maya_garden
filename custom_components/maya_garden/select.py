"""Modos de Irrigação (Select) para o Maya Garden."""
from homeassistant.components.select import SelectEntity
from homeassistant.helpers.restore_state import RestoreEntity
from .const import DOMAIN

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Configura os seletores dinamicamente baseados nas válvulas selecionadas."""
    valves = config_entry.data.get("valve_entities", [])
    entities = []
    
    for idx, valve in enumerate(valves):
        zone_id = idx + 1
        entities.append(MayaGardenModeSelect(zone_id, config_entry.entry_id))
        
    async_add_entities(entities)

class MayaGardenModeSelect(SelectEntity, RestoreEntity):
    """Representação dinâmica do input_select."""

    def __init__(self, zone_id, entry_id):
        """Inicializa."""
        self._zone_id = zone_id
        self._attr_name = f"Modo Zona {self._zone_id}"
        self._attr_unique_id = f"{entry_id}_maya_garden_zona_{self._zone_id}_modo"
        self._attr_icon = "mdi:water"
        self._attr_options = ["Desligado", "Automático", "Com Chuva"]
        self._current_option = "Automático"
        
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry_id)},
            "name": "Sistema de Irrigação",
            "manufacturer": "Maya",
            "model": "Garden v1.0",
        }

    @property
    def current_option(self):
        """Retorna a opção atual."""
        return self._current_option

    async def async_select_option(self, option: str) -> None:
        """Muda a opção via dashboard."""
        self._current_option = option
        self.async_write_ha_state()

    async def async_added_to_hass(self):
        """Restaura o estado quando reiniciar o Home Assistant."""
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state and state.state in self._attr_options:
            self._current_option = state.state
