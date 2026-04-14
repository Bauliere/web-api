/**
 * UIController — Controlador de la interfaz de usuario.
 * Encapsula toda la manipulación del DOM.
 */
import { GeoData } from './GeoData.js';

export class UIController {
  constructor() {
    // Elementos del DOM
    this.ipValue = document.getElementById('ipValue');
    this.skeleton = document.getElementById('skeleton');
    this.statusBadge = document.getElementById('statusBadge');
    this.statusText = document.getElementById('statusText');
    this.btnRefresh = document.getElementById('btnRefresh');
    this.refreshIcon = document.getElementById('refreshIcon');
    this.dataGrid = document.getElementById('dataGrid');
    this.sunGrid = document.getElementById('sunGrid');
  }

  /** Muestra el estado de carga. */
  showLoading(message = 'Conectando...') {
    this.skeleton.classList.remove('hidden');
    this.ipValue.classList.remove('visible', 'error-msg');
    this.ipValue.textContent = '';
    this.btnRefresh.disabled = true;
    this.btnRefresh.classList.add('loading');
    this.setStatus('loading', message);
    this.dataGrid.innerHTML = this._renderSkeletonCards(10);
    this.sunGrid.innerHTML = '';
  }

  /** Actualiza el badge de estado. */
  setStatus(status, message) {
    this.statusBadge.setAttribute('data-status', status);
    this.statusText.textContent = message;
  }

  /**
   * Renderiza la IP en la tarjeta principal.
   * @param {string} ip
   */
  showIP(ip) {
    this.skeleton.classList.add('hidden');
    this.ipValue.textContent = ip;
    this.ipValue.classList.remove('error-msg');
    requestAnimationFrame(() => this.ipValue.classList.add('visible'));
  }

  /**
   * Renderiza los 10 datos de conexión en el grid.
   * @param {GeoData} geoData
   */
  renderDataGrid(geoData) {
    const items = geoData.getDataItems();
    this.dataGrid.innerHTML = items.map((item, i) => `
      <div class="col-sm-6 col-lg-4">
        <div class="data-card animate-in" style="--delay: ${0.05 * (i + 1)}s">
          <div class="data-icon">
            <i class="bi ${item.icon}"></i>
          </div>
          <div class="data-content">
            <div class="data-label">${item.label}</div>
            <div class="data-value" title="${item.value}">${item.value}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Renderiza la tarjeta de ciclo solar (salida/puesta del sol).
   * @param {GeoData} geoData
   */
  renderSunCard(geoData) {
    // DST info
    const dstStartDate = geoData.dstStart?.utc_time?.replace('TIME ', '') || '—';
    const dstEndDate = geoData.dstEnd?.utc_time?.replace('TIME ', '') || '—';

    this.sunGrid.innerHTML = `
      <div class="col-6 col-md-3">
        <div class="sun-item animate-in" style="--delay: 0.1s">
          <div class="sun-icon"><i class="bi bi-sunrise-fill"></i></div>
          <div class="sun-label">Salida del sol</div>
          <div class="sun-value">${geoData.sunriseEstimate}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="sun-item animate-in" style="--delay: 0.15s">
          <div class="sun-icon"><i class="bi bi-sunset-fill"></i></div>
          <div class="sun-label">Puesta del sol</div>
          <div class="sun-value">${geoData.sunsetEstimate}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="sun-item animate-in" style="--delay: 0.2s">
          <div class="sun-icon"><i class="bi bi-arrow-up-right-circle"></i></div>
          <div class="sun-label">DST Start (UTC)</div>
          <div class="sun-value" style="font-size:0.72rem">${dstStartDate}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="sun-item animate-in" style="--delay: 0.25s">
          <div class="sun-icon"><i class="bi bi-arrow-down-left-circle"></i></div>
          <div class="sun-label">DST End (UTC)</div>
          <div class="sun-value" style="font-size:0.72rem">${dstEndDate}</div>
        </div>
      </div>
    `;

    // También mostrar bandera si existe
    const flagRow = document.getElementById('countryFlagRow');
    if (flagRow) {
      const flagImg = document.getElementById('countryFlag');
      const emojiEl = document.getElementById('countryEmoji');
      if (geoData.flagUrl && flagImg) {
        flagImg.src = geoData.flagUrl;
        flagImg.alt = `Bandera de ${geoData.country}`;
        flagImg.style.display = 'block';
      }
      if (geoData.emoji && emojiEl) {
        emojiEl.textContent = geoData.emoji;
      }
    }
  }

  /** Muestra un error global. */
  showError(message) {
    this.skeleton.classList.add('hidden');
    if (!this.ipValue.textContent) {
      this.ipValue.textContent = message;
      this.ipValue.classList.add('error-msg');
      requestAnimationFrame(() => this.ipValue.classList.add('visible'));
    }
    this.setStatus('error', 'Error de conexión');
  }

  /** Rehabilita el botón de actualizar. */
  enableRefresh() {
    this.btnRefresh.disabled = false;
    this.btnRefresh.classList.remove('loading');
  }

  /** Genera skeleton placeholders para las data cards. */
  _renderSkeletonCards(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="col-sm-6 col-lg-4">
          <div class="data-card">
            <div class="skeleton" style="width:36px;height:36px;border-radius:0.5rem;flex-shrink:0"></div>
            <div class="data-content" style="width:100%">
              <div class="skeleton" style="width:60%;height:10px;margin-bottom:6px"></div>
              <div class="skeleton" style="width:85%;height:14px"></div>
            </div>
          </div>
        </div>`;
    }
    return html;
  }
}
