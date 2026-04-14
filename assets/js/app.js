/**
 * Web-API — app.js
 * Consume la API pública de ipify para obtener la IP del cliente.
 * Usa fetch con async/await, manejo de errores y estados visuales.
 */

// === Constantes ===
const API_URL = 'https://api.ipify.org?format=json';

// === Elementos del DOM ===
const elements = {
  ipValue: document.getElementById('ipValue'),
  skeleton: document.getElementById('skeleton'),
  statusBar: document.getElementById('statusBar'),
  statusText: document.getElementById('statusText'),
  lastFetch: document.getElementById('lastFetch'),
  btnRefresh: document.getElementById('btnRefresh'),
};

// === Estado de la aplicación ===
let isFetching = false;

/**
 * Actualiza el indicador de estado visual.
 * @param {'loading' | 'success' | 'error'} status
 * @param {string} message
 */
function setStatus(status, message) {
  elements.statusBar.setAttribute('data-status', status);
  elements.statusText.textContent = message;
}

/**
 * Formatea la hora actual en formato legible.
 * @returns {string}
 */
function getFormattedTime() {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

/**
 * Obtiene la IP pública del cliente desde la API de ipify.
 * Muestra el resultado en el DOM y en la consola.
 */
async function fetchIP() {
  // Evitar múltiples peticiones simultáneas
  if (isFetching) return;
  isFetching = true;

  // Preparar UI: mostrar skeleton, ocultar IP anterior
  elements.skeleton.classList.remove('hidden');
  elements.ipValue.classList.remove('visible', 'error-message');
  elements.ipValue.textContent = '';
  elements.btnRefresh.disabled = true;
  elements.btnRefresh.classList.add('loading');
  setStatus('loading', 'Conectando...');

  try {
    // Consumir la API con fetch
    const response = await fetch(API_URL);

    // Verificar que la respuesta sea exitosa
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Procesar la respuesta JSON
    const data = await response.json();
    const ip = data.ip;

    // Validar que la propiedad "ip" exista
    if (!ip) {
      throw new Error('La respuesta no contiene la propiedad "ip".');
    }

    // Imprimir la IP en la consola
    console.log(`[Web-API] IP pública obtenida: ${ip}`);

    // Ocultar skeleton y mostrar IP con animación
    elements.skeleton.classList.add('hidden');
    elements.ipValue.textContent = ip;
    elements.ipValue.classList.remove('error-message');

    // Trigger animation frame para la transición
    requestAnimationFrame(() => {
      elements.ipValue.classList.add('visible');
    });

    // Actualizar estado y timestamp
    setStatus('success', 'IP obtenida');
    elements.lastFetch.textContent = getFormattedTime();

  } catch (error) {
    // Imprimir error en consola
    console.error('[Web-API] Error al obtener la IP:', error.message);

    // Ocultar skeleton y mostrar mensaje de error
    elements.skeleton.classList.add('hidden');
    elements.ipValue.textContent = 'No se pudo obtener la IP';
    elements.ipValue.classList.add('error-message');

    requestAnimationFrame(() => {
      elements.ipValue.classList.add('visible');
    });

    setStatus('error', 'Error de conexión');
    elements.lastFetch.textContent = getFormattedTime();

  } finally {
    // Rehabilitar el botón de refresh
    isFetching = false;
    elements.btnRefresh.disabled = false;
    elements.btnRefresh.classList.remove('loading');
  }
}

// === Event Listeners ===

// Botón "Actualizar IP" reutiliza la misma función
elements.btnRefresh.addEventListener('click', fetchIP);

// === Inicialización ===
// Obtener la IP automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', fetchIP);

// === Dark/Light Mode Toggle ===
(function initThemeToggle() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;

  // Detectar preferencia del sistema
  let currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  root.setAttribute('data-theme', currentTheme);
  updateToggleIcon(toggle, currentTheme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', currentTheme);
      toggle.setAttribute(
        'aria-label',
        `Cambiar a modo ${currentTheme === 'dark' ? 'claro' : 'oscuro'}`
      );
      updateToggleIcon(toggle, currentTheme);
    });
  }
})();

/**
 * Actualiza el ícono del toggle de tema.
 * @param {HTMLElement} toggle
 * @param {'light' | 'dark'} theme
 */
function updateToggleIcon(toggle, theme) {
  if (!toggle) return;

  // Sol para modo oscuro (cambiar a claro), luna para modo claro (cambiar a oscuro)
  toggle.innerHTML = theme === 'dark'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}
