"""The Maya Garden integration."""
import logging
import os
from datetime import datetime
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.frontend import add_extra_js_url

from .const import DOMAIN
from .coordinator import MayaGardenCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["select", "time", "number", "switch"]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Maya Garden from a config entry."""
    _LOGGER.info("Iniciando setup do Maya Garden (Entry: %s)", entry.entry_id)
    
    # Debug para arquivo externo ja que o log principal sumiu
    try:
        debug_path = hass.config.path("maya_debug_log.txt")
        with open(debug_path, "a") as f:
            f.write(f"\n--- Setup iniciado em {datetime.now()} ---\n")
            f.write(f"Entry ID: {entry.entry_id}\n")
    except Exception as log_err:
        _LOGGER.error("Erro ao escrever log debug: %s", log_err)

    # Registrar caminho estatico para o card
    frontend_path = os.path.join(os.path.dirname(__file__), "frontend")
    if os.path.exists(frontend_path):
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig("/maya_garden_static", frontend_path, False)]
            )
            _LOGGER.info("Caminho estatico registrado: /maya_garden_static -> %s", frontend_path)
            
            add_extra_js_url(hass, "/maya_garden_static/maya-garden-card.js?v=20260414c")
            
            with open(debug_path, "a") as f:
                f.write("Frontend registrado com sucesso (v2).\n")
        except Exception as fe_err:
            _LOGGER.error("Erro ao registrar frontend: %s", fe_err)
            with open(debug_path, "a") as f:
                f.write(f"Erro no Frontend: {fe_err}\n")
    else:
        _LOGGER.error("Pasta frontend nao encontrada em %s", frontend_path)
        with open(debug_path, "a") as f:
            f.write("Erro: Pasta frontend nao encontrada.\n")

    # 2. Instancia o motor de agendamento (Coordinator)
    coordinator = MayaGardenCoordinator(hass, entry)
    await coordinator.async_setup()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "data": entry.data
    }

    # 3. Carrega as plataformas
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Maya Garden component."""
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
