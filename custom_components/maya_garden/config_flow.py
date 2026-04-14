"""Config flow for Maya Garden integration."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers import selector
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, CONF_PUMP_ENTITY, CONF_VALVE_ENTITIES, CONF_RAIN_SENSOR

class MayaGardenConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Maya Garden."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial config step."""
        errors = {}

        if user_input is not None:
            if not user_input.get(CONF_VALVE_ENTITIES):
                 errors["base"] = "no_valves"
            else:
                 return self.async_create_entry(title="Sistema de Irrigação", data=user_input)

        data_schema = vol.Schema({
            vol.Required(
                CONF_PUMP_ENTITY, 
                description={"suggested_value": "switch.irrigacao_interruptor_3"}
            ): selector.EntitySelector(
                selector.EntitySelectorConfig(domain=["switch"])
            ),
            vol.Required(
                CONF_VALVE_ENTITIES,
                description={"suggested_value": ["switch.irrigacao_interruptor_1", "switch.irrigacao_interruptor_2"]}
            ): selector.EntitySelector(
                selector.EntitySelectorConfig(domain=["switch", "valve"], multiple=True)
            ),
            vol.Optional(
                CONF_RAIN_SENSOR,
                description={"suggested_value": "binary_sensor.chuva_umidade"}
            ): selector.EntitySelector(
                selector.EntitySelectorConfig(domain=["binary_sensor"])
            ),
        })

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors
        )
