class MayaGardenCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this.innerHTML = `
        <style>
          .mg-card { font-family: var(--paper-font-body1_-_font-family); overflow: hidden; }

          /* ===== HERO HEADER ===== */
          .mg-hero {
            background: linear-gradient(135deg, #1a3a1a 0%, #2e5d2e 40%, #1b4332 100%);
            padding: 28px 24px 24px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .mg-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(ellipse at 30% 50%, rgba(76,175,80,0.15) 0%, transparent 60%);
            pointer-events: none;
          }
          .mg-hero-logo {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.3);
            object-fit: cover;
            margin-bottom: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            position: relative;
          }
          .mg-hero-name {
            font-size: 1.8em;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 1px;
            margin-bottom: 6px;
            position: relative;
          }
          .mg-hero-tagline {
            font-size: 0.82em;
            color: rgba(255,255,255,0.75);
            font-style: italic;
            margin-bottom: 10px;
            position: relative;
            line-height: 1.4;
          }
          .mg-hero-sites {
            display: flex;
            justify-content: center;
            gap: 16px;
            position: relative;
          }
          .mg-hero-sites a {
            color: #81c784;
            text-decoration: none;
            font-size: 0.75em;
            font-weight: 600;
            padding: 4px 14px;
            border: 1px solid rgba(129,199,132,0.3);
            border-radius: 20px;
            transition: all 0.2s;
          }
          .mg-hero-sites a:hover {
            background: rgba(129,199,132,0.15);
            border-color: rgba(129,199,132,0.6);
          }

          /* ===== STATUS PANEL ===== */
          .mg-body { padding: 16px; }
          .mg-status-panel { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 18px; }
          .mg-status-item { text-align: center; padding: 12px 6px; border-radius: 12px; background: var(--secondary-background-color); transition: all 0.3s; }
          .mg-status-icon { font-size: 2em; display: block; margin-bottom: 4px; }
          .mg-status-label { font-size: 0.7em; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: 0.5px; }
          .mg-status-value { font-size: 0.85em; font-weight: bold; margin-top: 2px; }
          .mg-status-active { background: linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.08)); border: 1px solid rgba(76,175,80,0.3); }
          .mg-status-alert { background: linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,152,0,0.08)); border: 1px solid rgba(255,152,0,0.3); }

          /* ===== ZONE BOX ===== */
          .mg-zone-box { background: var(--card-background-color); border-radius: 14px; border: 1px solid var(--divider-color); padding: 14px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .mg-zone-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .mg-zone-title { font-size: 1.15em; font-weight: bold; }
          .mg-zone-badge { padding: 5px 14px; border-radius: 20px; font-size: 0.75em; font-weight: bold; }
          .mg-badge-on { background: #4caf50; color: white; animation: mg-pulse 2s infinite; }
          .mg-badge-off { background: var(--divider-color); color: var(--secondary-text-color); }
          .mg-badge-rain { background: #ff9800; color: white; }
          @keyframes mg-pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.6; } }

          /* ===== CONTROLS ===== */
          .mg-controls { display: flex; gap: 8px; margin-bottom: 12px; }
          .mg-control-item { flex: 1; padding: 8px; border-radius: 10px; background: var(--secondary-background-color); text-align: center; }
          .mg-control-label { font-size: 0.7em; color: var(--secondary-text-color); margin-bottom: 4px; }

          /* ===== SCHEDULE ===== */
          .mg-sched { background: var(--secondary-background-color); padding: 10px 12px; border-radius: 10px; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
          .mg-sched-num { width: 28px; height: 28px; border-radius: 50%; background: var(--divider-color); display: flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: bold; flex-shrink: 0; }
          .mg-sched-num-on { background: #4caf50; color: white; }
          .mg-sched-body { flex: 1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .mg-sched-time { background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 6px; padding: 4px 6px; color: var(--primary-text-color); font-size: 0.95em; width: 85px; }
          .mg-sched-dur { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 100px; }
          .mg-sched-dur-val { font-size: 0.85em; font-weight: bold; min-width: 40px; text-align: center; }
          .mg-slider { flex: 1; accent-color: #4caf50; min-width: 60px; }
          .mg-btn { cursor: pointer; padding: 5px 12px; border-radius: 8px; font-size: 0.8em; font-weight: bold; border: none; min-width: 42px; transition: all 0.2s; }
          .mg-btn:active { transform: scale(0.95); }
          .mg-btn-on { background: #4caf50; color: white; }
          .mg-btn-off { background: var(--divider-color); color: var(--primary-text-color); }
          .mg-btn-rain { background: #2196f3; color: white; }
          .mg-btn-rain-on { background: #ff9800; color: white; }
          .mg-select { background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 6px; padding: 6px 8px; color: var(--primary-text-color); width: 100%; font-size: 0.9em; }

          /* ===== LOG DE ATIVIDADE ===== */
          .mg-log { padding: 0 16px 8px; }
          .mg-log-title { font-size: 0.85em; font-weight: bold; color: var(--primary-text-color); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
          .mg-log-list { max-height: 180px; overflow-y: auto; }
          .mg-log-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; margin-bottom: 4px; background: var(--secondary-background-color); font-size: 0.78em; }
          .mg-log-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
          .mg-log-dot-z1 { background: #4caf50; }
          .mg-log-dot-z2 { background: #2196f3; }
          .mg-log-zone { font-weight: bold; min-width: 50px; }
          .mg-log-time { color: var(--secondary-text-color); min-width: 90px; }
          .mg-log-dur { color: var(--primary-text-color); margin-left: auto; font-weight: 600; }
          .mg-log-empty { text-align: center; padding: 12px; color: var(--secondary-text-color); font-size: 0.8em; font-style: italic; }

          /* ===== FOOTER ===== */
          .mg-footer { text-align: center; padding: 10px 16px 14px; border-top: 1px solid var(--divider-color); }
          .mg-footer-text { font-size: 0.6em; color: var(--secondary-text-color); opacity: 0.5; letter-spacing: 0.5px; }
        </style>
        <ha-card>
          <div class="mg-card">
            <div class="mg-hero">
              <img src="/maya_garden_static/logo.jpg" class="mg-hero-logo" alt="Maya Garden" onerror="this.style.display='none'">
              <div class="mg-hero-name">Maya Garden</div>
              <div class="mg-hero-tagline">O primeiro sistema de irrigação com<br>inteligência artificial do mercado</div>
              <div class="mg-hero-sites">
                <a href="https://www.hiperenge.com.br" target="_blank">hiperenge.com.br</a>
                <a href="https://www.mayahome.ia.br" target="_blank">mayahome.ia.br</a>
              </div>
            </div>
            <div class="mg-body">
              <div id="mg-status-panel" class="mg-status-panel"></div>
              <div id="mg-zones-container"></div>
            </div>
            <div class="mg-log">
              <div class="mg-log-title">📋 Histórico de Irrigação</div>
              <div id="mg-log-list" class="mg-log-list"><div class="mg-log-empty">Carregando histórico...</div></div>
            </div>
            <div class="mg-footer">
              <div class="mg-footer-text">MAYA GARDEN · HIPERENGE ENGENHARIA · IRRIGAÇÃO INTELIGENTE</div>
            </div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector('#mg-zones-container');
      this.statusPanel = this.querySelector('#mg-status-panel');

      this.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-toggle-entity]');
        if (btn && this._hass) {
          const entityId = btn.dataset.toggleEntity;
          const st = this._hass.states[entityId];
          if (st) this._hass.callService('switch', st.state === 'on' ? 'turn_off' : 'turn_on', { entity_id: entityId });
        }
      });
      this.addEventListener('change', (e) => {
        const el = e.target;
        if (!this._hass) return;
        if (el.dataset.timeEntity) this._hass.callService('time', 'set_value', { entity_id: el.dataset.timeEntity, time: el.value + ':00' });
        else if (el.dataset.selectEntity) this._hass.callService('select', 'select_option', { entity_id: el.dataset.selectEntity, option: el.value });
        else if (el.dataset.numberEntity) this._hass.callService('number', 'set_value', { entity_id: el.dataset.numberEntity, value: parseFloat(el.value) });
      });
      this.addEventListener('input', (e) => {
        const el = e.target;
        if (el.dataset.numberEntity) {
          const lbl = el.closest('.mg-sched-dur')?.querySelector('.mg-sched-dur-val');
          if (lbl) lbl.textContent = el.value + ' min';
        }
      });
      // Fetch history on init and every 5 min
      this._fetchHistory();
      this._historyInterval = setInterval(() => this._fetchHistory(), 300000);
    }
    this._updateUI();
  }

  async _fetchHistory() {
    if (!this._hass) return;
    try {
      const now = new Date();
      const start = new Date(now.getTime() - 48 * 3600 * 1000); // 48h
      const startISO = start.toISOString();
      const endISO = now.toISOString();
      const v1 = this._find(this._hass.states, ['switch.', 'irrigacao', 'interruptor_1']) || 'switch.irrigacao_interruptor_1';
      const v2 = this._find(this._hass.states, ['switch.', 'irrigacao', 'interruptor_2']) || 'switch.irrigacao_interruptor_2';
      const entities = `${v1},${v2}`;
      const url = `history/period/${startISO}?end_time=${endISO}&filter_entity_id=${entities}&minimal_response&no_attributes`;
      const result = await this._hass.callApi('GET', url);
      this._processHistory(result, v1, v2);
    } catch (e) {
      const logEl = this.querySelector('#mg-log-list');
      if (logEl) logEl.innerHTML = '<div class="mg-log-empty">Histórico indisponível</div>';
    }
  }

  _processHistory(result, v1Id, v2Id) {
    const logEl = this.querySelector('#mg-log-list');
    if (!logEl || !result) return;

    const events = [];
    const valveMap = { [v1Id]: 'Zona 1', [v2Id]: 'Zona 2' };
    const dotMap = { [v1Id]: 'mg-log-dot-z1', [v2Id]: 'mg-log-dot-z2' };

    result.forEach(entityHistory => {
      if (!entityHistory || !entityHistory.length) return;
      const entityId = entityHistory[0]?.entity_id;
      const zoneName = valveMap[entityId] || 'Zona ?';
      const dotClass = dotMap[entityId] || 'mg-log-dot-z1';
      let onTime = null;

      entityHistory.forEach(state => {
        if (state.state === 'on' && !onTime) {
          onTime = new Date(state.last_changed);
        } else if (state.state === 'off' && onTime) {
          const offTime = new Date(state.last_changed);
          const durMin = Math.round((offTime - onTime) / 60000);
          if (durMin > 0 && durMin < 120) {
            events.push({
              zone: zoneName,
              dotClass: dotClass,
              start: onTime,
              duration: durMin,
            });
          }
          onTime = null;
        }
      });
      // Still on
      if (onTime) {
        const durMin = Math.round((new Date() - onTime) / 60000);
        events.push({ zone: zoneName, dotClass: dotClass, start: onTime, duration: durMin, active: true });
      }
    });

    events.sort((a, b) => b.start - a.start);

    if (!events.length) {
      logEl.innerHTML = '<div class="mg-log-empty">Nenhuma irrigação nas últimas 48h</div>';
      return;
    }

    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const fmt = (d) => {
      const isToday = d.toDateString() === today.toDateString();
      const isYest = d.toDateString() === yesterday.toDateString();
      const prefix = isToday ? 'Hoje' : isYest ? 'Ontem' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${prefix} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    logEl.innerHTML = events.slice(0, 15).map(e => `
      <div class="mg-log-item">
        <div class="mg-log-dot ${e.dotClass}"></div>
        <div class="mg-log-zone">${e.zone}</div>
        <div class="mg-log-time">${fmt(e.start)}</div>
        <div class="mg-log-dur">${e.active ? '⏱️ Em curso' : e.duration + ' min'}</div>
      </div>
    `).join('');
  }

  _find(states, patterns) {
    return Object.keys(states).find(e => patterns.every(p => e.includes(p))) || '';
  }

  _updateUI() {
    const h = this._hass;
    if (!h || !this.content) return;

    const modeEnts = Object.keys(h.states).filter(e => e.startsWith('select.') && e.includes('modo_zona_')).sort();
    if (!modeEnts.length) {
      this.content.innerHTML = '<div style="text-align:center;padding:20px;color:var(--secondary-text-color)">⏳ Aguardando entidades...</div>';
      return;
    }

    const pumpEnt = this._find(h.states, ['switch.', 'irrigacao', 'interruptor_3']) || 'switch.irrigacao_interruptor_3';
    const pumpOn = h.states[pumpEnt]?.state === 'on';
    const rainEnt = this._find(h.states, ['binary_sensor.', 'chuva']) || this._find(h.states, ['binary_sensor.', 'rain']);
    const rainOn = rainEnt ? h.states[rainEnt]?.state === 'on' : false;
    const v1 = this._find(h.states, ['switch.', 'irrigacao', 'interruptor_1']);
    const v2 = this._find(h.states, ['switch.', 'irrigacao', 'interruptor_2']);
    const z1on = v1 ? h.states[v1]?.state === 'on' : false;
    const z2on = v2 ? h.states[v2]?.state === 'on' : false;
    const irrigating = z1on || z2on;
    const activeZone = z1on && z2on ? 'Zona 1 + 2' : z1on ? 'Zona 1' : z2on ? 'Zona 2' : '-';

    this.statusPanel.innerHTML = `
      <div class="mg-status-item ${pumpOn ? 'mg-status-active' : ''}">
        <span class="mg-status-icon">${pumpOn ? '💧' : '⚫'}</span>
        <div class="mg-status-label">Bomba</div>
        <div class="mg-status-value" style="color:${pumpOn ? '#4caf50' : 'inherit'}">${pumpOn ? 'Ligada' : 'Desligada'}</div>
      </div>
      <div class="mg-status-item ${irrigating ? 'mg-status-active' : ''}">
        <span class="mg-status-icon">${irrigating ? '🌿' : '⏸️'}</span>
        <div class="mg-status-label">Irrigação</div>
        <div class="mg-status-value" style="color:${irrigating ? '#4caf50' : 'inherit'}">${irrigating ? activeZone : 'Parada'}</div>
      </div>
      <div class="mg-status-item ${rainOn ? 'mg-status-alert' : ''}">
        <span class="mg-status-icon">${rainOn ? '🌧️' : '☀️'}</span>
        <div class="mg-status-label">Clima</div>
        <div class="mg-status-value" style="color:${rainOn ? '#ff9800' : 'inherit'}">${rainOn ? 'Chovendo' : 'Seco'}</div>
      </div>
    `;

    let html = '';
    modeEnts.forEach(modeEnt => {
      const m = modeEnt.match(/zona_(\d+)/);
      if (!m) return;
      const z = m[1];
      const pauseEnt = this._find(h.states, ['switch.', `zona_${z}`, 'chuva']) || this._find(h.states, ['switch.', `zona_${z}`, 'pausa']);
      const modeState = h.states[modeEnt]?.state || 'Desligado';
      const pauseOn = pauseEnt ? h.states[pauseEnt]?.state === 'on' : false;
      const valveEnt = this._find(h.states, ['switch.', 'irrigacao', `interruptor_${z}`]);
      const valveOn = valveEnt ? h.states[valveEnt]?.state === 'on' : false;
      const badgeText = valveOn ? '💧 Irrigando' : pauseOn ? '🌧️ Pausada' : modeState === 'Desligado' ? '⛔ Desligada' : '✅ Pronta';

      html += `
        <div class="mg-zone-box">
          <div class="mg-zone-header">
            <div class="mg-zone-title">🌿 Zona ${z}</div>
            <span class="mg-zone-badge ${valveOn ? 'mg-badge-on' : pauseOn ? 'mg-badge-rain' : 'mg-badge-off'}">${badgeText}</span>
          </div>
          <div class="mg-controls">
            <div class="mg-control-item">
              <div class="mg-control-label">Modo</div>
              <select class="mg-select" data-select-entity="${modeEnt}">
                ${(h.states[modeEnt]?.attributes?.options || ['Desligado','Automático','Com Chuva']).map(o => `<option value="${o}" ${o===modeState?'selected':''}>${o === 'Desligado' ? '⛔ Desligado' : o === 'Automático' ? '🤖 Automático' : '🌧️ Com Chuva'}</option>`).join('')}
              </select>
            </div>
            <div class="mg-control-item" style="flex:0 0 auto">
              <div class="mg-control-label">Pausa Chuva</div>
              ${pauseEnt ? `<button class="mg-btn ${pauseOn ? 'mg-btn-rain-on' : 'mg-btn-rain'}" data-toggle-entity="${pauseEnt}">${pauseOn ? '🌧️ SIM' : '☀️ NÃO'}</button>` : '-'}
            </div>
          </div>
      `;
      for (let s = 1; s <= 4; s++) {
        const aEnt = this._find(h.states, [`zona_${z}`, `horario_${s}`, 'ativo']);
        const tEnt = this._find(h.states, ['time.', `zona_${z}`, `horario_${s}`]);
        const dEnt = this._find(h.states, ['number.', `zona_${z}`, `horario_${s}`, 'duracao']);
        const on = aEnt ? h.states[aEnt]?.state === 'on' : false;
        const tv = tEnt ? h.states[tEnt]?.state || '00:00' : '00:00';
        const dv = dEnt ? h.states[dEnt]?.state || 5 : 5;
        html += `
          <div class="mg-sched">
            <div class="mg-sched-num ${on ? 'mg-sched-num-on' : ''}">${s}</div>
            <div class="mg-sched-body">
              <input type="time" class="mg-sched-time" value="${String(tv).substring(0,5)}" data-time-entity="${tEnt}" ${!on ? 'style="opacity:0.4"' : ''}>
              <div class="mg-sched-dur">
                <span class="mg-sched-dur-val">${dv} min</span>
                <input type="range" class="mg-slider" min="1" max="10" value="${dv}" data-number-entity="${dEnt}" ${!on ? 'style="opacity:0.4"' : ''}>
              </div>
            </div>
            <button class="mg-btn ${on ? 'mg-btn-on' : 'mg-btn-off'}" data-toggle-entity="${aEnt}">${on ? 'ON' : 'OFF'}</button>
          </div>
        `;
      }
      html += `</div>`;
    });
    this.content.innerHTML = html;
  }

  setConfig(config) { this.config = config; }
  getCardSize() { return 14; }
}

customElements.define('maya-garden-card', MayaGardenCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "maya-garden-card", name: "Maya Garden", description: "O primeiro sistema de irrigação com inteligência artificial do mercado.", preview: true });
