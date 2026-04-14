class MayaGardenCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this.innerHTML = `
        <style>
          .mg-card { padding: 16px; font-family: var(--paper-font-body1_-_font-family); }
          .mg-header { display: flex; align-items: center; margin-bottom: 20px; }
          .mg-logo { width: 48px; height: 48px; margin-right: 12px; border-radius: 50%; border: 2px solid var(--primary-color); display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white; font-size: 1.5em; font-weight: bold; }
          .mg-zone-box { background: var(--card-background-color); border-radius: 12px; border: 1px solid var(--divider-color); padding: 12px; margin-bottom: 16px; box-shadow: var(--ha-card-box-shadow); }
          .mg-zone-title { font-size: 1.1em; font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; }
          .mg-control-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
          .mg-schedule-row { background: var(--secondary-background-color); padding: 10px; border-radius: 8px; margin-bottom: 8px; }
          .mg-schedule-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .mg-inputs { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
          .mg-toggle { cursor: pointer; padding: 6px 14px; border-radius: 12px; font-size: 0.85em; font-weight: bold; border: none; min-width: 55px; }
          .mg-toggle-on { background: var(--success-color, #4caf50); color: white; }
          .mg-toggle-off { background: var(--divider-color, #ccc); color: var(--primary-text-color); }
          .mg-time-input { background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 4px; padding: 4px 6px; color: var(--primary-text-color); font-size: 0.95em; width: 90px; }
          .mg-slider { flex-grow: 1; accent-color: var(--primary-color); }
          .mg-select { background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 4px; padding: 6px; color: var(--primary-text-color); width: 100%; }
          .status-on { color: var(--success-color, #4caf50); }
          .status-off { color: var(--error-color, #f44336); }
          .label { font-size: 0.8em; color: var(--secondary-text-color); }
        </style>
        <ha-card>
          <div class="mg-card">
            <div class="mg-header">
              <div class="mg-logo">🌱</div>
              <div>
                <div style="font-size: 1.3em; font-weight: bold;">Maya Garden</div>
                <div id="mg-status-summary" class="label">Monitorando...</div>
              </div>
            </div>
            <div id="mg-zones-container"></div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector('#mg-zones-container');

      this.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-toggle-entity]');
        if (btn && this._hass) {
          const entityId = btn.dataset.toggleEntity;
          const st = this._hass.states[entityId];
          if (st) {
            const service = st.state === 'on' ? 'turn_off' : 'turn_on';
            this._hass.callService('switch', service, { entity_id: entityId });
          }
        }
      });

      this.addEventListener('change', (e) => {
        const el = e.target;
        if (!this._hass) return;
        if (el.dataset.timeEntity) {
          const val = el.value.length === 5 ? el.value + ':00' : el.value;
          this._hass.callService('time', 'set_value', { entity_id: el.dataset.timeEntity, time: val });
        } else if (el.dataset.selectEntity) {
          this._hass.callService('select', 'select_option', { entity_id: el.dataset.selectEntity, option: el.value });
        }
      });

      this.addEventListener('input', (e) => {
        const el = e.target;
        if (el.dataset.numberEntity) {
          const label = el.parentElement.querySelector('.label');
          if (label) label.textContent = `Duração: ${el.value} min`;
        }
      });

      this.addEventListener('change', (e) => {
        const el = e.target;
        if (el.dataset.numberEntity && this._hass) {
          this._hass.callService('number', 'set_value', { entity_id: el.dataset.numberEntity, value: parseFloat(el.value) });
        }
      });
    }

    this._updateUI();
  }

  _findEntity(states, patterns) {
    return Object.keys(states).find(e => patterns.every(p => e.includes(p))) || '';
  }

  _updateUI() {
    const hass = this._hass;
    if (!hass || !this.content) return;

    // Buscar entidades de modo (select que contém modo_zona_)
    const modeEntities = Object.keys(hass.states).filter(e =>
      e.startsWith('select.') && e.includes('modo_zona_')
    ).sort();

    if (modeEntities.length === 0) {
      this.content.innerHTML = '<div style="text-align:center; padding:20px; color: var(--secondary-text-color);">⏳ Aguardando entidades da integração Maya Garden...</div>';
      return;
    }

    // Status da bomba e chuva
    const pumpEnt = this._findEntity(hass.states, ['switch.', 'irrigacao', 'interruptor_3']) || 'switch.irrigacao_interruptor_3';
    const pumpOn = hass.states[pumpEnt]?.state === 'on';
    
    // Buscar sensor de chuva dinamicamente
    const rainEnt = this._findEntity(hass.states, ['binary_sensor.', 'chuva']) || this._findEntity(hass.states, ['binary_sensor.', 'rain']);
    const rainOn = rainEnt ? hass.states[rainEnt]?.state === 'on' : false;

    const summary = this.querySelector('#mg-status-summary');
    if (summary) {
      summary.innerHTML = `<span class="${pumpOn ? 'status-on' : ''}">Bomba: ${pumpOn ? '💧 ON' : '⚫ Standby'}</span> · <span class="${rainOn ? 'status-off' : ''}">Chuva: ${rainOn ? '🌧️ ON' : '☀️ Seco'}</span>`;
    }

    let html = '';
    modeEntities.forEach(modeEnt => {
      const match = modeEnt.match(/zona_(\d+)/);
      if (!match) return;
      const z = match[1];

      // Buscar pausa por chuva
      const pauseEnt = this._findEntity(hass.states, ['switch.', `zona_${z}`, 'chuva']) ||
                        this._findEntity(hass.states, ['switch.', `zona_${z}`, 'pausa']);
      const modeState = hass.states[modeEnt]?.state || 'Desligado';
      const pauseOn = pauseEnt ? hass.states[pauseEnt]?.state === 'on' : false;

      html += `
        <div class="mg-zone-box">
          <div class="mg-zone-title">🌿 Zona ${z}</div>
          <div class="mg-control-grid">
            <div class="mg-schedule-row" style="margin:0">
              <div class="label">Modo</div>
              <select class="mg-select" data-select-entity="${modeEnt}">
                ${(hass.states[modeEnt]?.attributes?.options || ['Desligado', 'Automático', 'Com Chuva']).map(o => `<option value="${o}" ${o === modeState ? 'selected' : ''}>${o}</option>`).join('')}
              </select>
            </div>
            <div class="mg-schedule-row" style="margin:0; display:flex; justify-content:space-between; align-items:center">
              <div class="label">Pausa Chuva</div>
              ${pauseEnt ? `<button class="mg-toggle ${pauseOn ? 'mg-toggle-on' : 'mg-toggle-off'}" data-toggle-entity="${pauseEnt}">${pauseOn ? 'ON' : 'OFF'}</button>` : '<span class="label">-</span>'}
            </div>
          </div>
          <div class="label" style="margin:10px 0 5px">Horários de Irrigação</div>
      `;

      for (let s = 1; s <= 4; s++) {
        const activeEnt = this._findEntity(hass.states, [`zona_${z}`, `horario_${s}`, 'ativo']);
        const timeEnt = this._findEntity(hass.states, ['time.', `zona_${z}`, `horario_${s}`]);
        const durEnt = this._findEntity(hass.states, ['number.', `zona_${z}`, `horario_${s}`, 'duracao']);

        const active = activeEnt ? hass.states[activeEnt]?.state === 'on' : false;
        const timeVal = timeEnt ? hass.states[timeEnt]?.state || '00:00' : '00:00';
        const durVal = durEnt ? hass.states[durEnt]?.state || 5 : 5;

        html += `
          <div class="mg-schedule-row">
            <div class="mg-schedule-header">
              <span>Turno ${s}</span>
              ${activeEnt ? `<button class="mg-toggle ${active ? 'mg-toggle-on' : 'mg-toggle-off'}" data-toggle-entity="${activeEnt}">${active ? 'ON' : 'OFF'}</button>` : '<span class="label">-</span>'}
            </div>
            <div class="mg-inputs">
              <div><div class="label">Hora</div><input type="time" class="mg-time-input" value="${String(timeVal).substring(0, 5)}" data-time-entity="${timeEnt}"></div>
              <div style="flex-grow:1; margin-left:10px"><div class="label">Duração: ${durVal} min</div><input type="range" class="mg-slider" min="1" max="60" value="${durVal}" data-number-entity="${durEnt}"></div>
            </div>
          </div>
        `;
      }
      html += `</div>`;
    });
    this.content.innerHTML = html;
  }

  setConfig(config) { this.config = config; }
  getCardSize() { return 10; }
}

customElements.define('maya-garden-card', MayaGardenCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "maya-garden-card",
  name: "Maya Garden",
  description: "Painel de controle para irrigação inteligente.",
  preview: true
});
