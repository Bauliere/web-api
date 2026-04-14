/**
 * Web-API v2 — app.js
 * 1. Obtiene la IP pública desde ipify.
 * 2. Usa esa IP para consultar ipgeolocation.io (v3).
 * 3. Muestra continente, ciudad, país y hora local.
 * 4. Imprime toda la info de geolocation en console.log.
 * 5. Cicla entre 3 temas con un botón único.
 */

// === Constantes ===
const IPIFY_URL = 'https://api.ipify.org?format=json';
const GEO_API_KEY = '6178dbf74ada4505a763acd4769729b7';
const GEO_BASE = 'https://api.ipgeolocation.io/v3/ipgeo';

// === Temas: orden de ciclo ===
const THEMES = [
  { id: 'sakura', label: 'Sakura', icon: 'sun' },
  { id: 'ember',  label: 'Ember',  icon: 'flame' },
  { id: 'neon',   label: 'Neon',   icon: 'zap' },
];

// === Elementos del DOM ===
const el = {
  ipValue:      document.getElementById('ipValue'),
  skeleton:     document.getElementById('skeleton'),
  statusBar:    document.getElementById('statusBar'),
  statusText:   document.getElementById('statusText'),
  btnRefresh:   document.getElementById('btnRefresh'),
  themeToggle:  document.getElementById('themeToggle'),
  themeLabel:   document.getElementById('themeLabel'),
  // Geo elements
  geoContinent: document.getElementById('geoContinent'),
  geoCity:      document.getElementById('geoCity'),
  geoCountry:   document.getElementById('geoCountry'),
  geoTime:      document.getElementById('geoTime'),
  geoISP:       document.getElementById('geoISP'),
  geoTimezone:  document.getElementById('geoTimezone'),
  geoCurrency:  document.getElementById('geoCurrency'),
  countryFlag:  document.getElementById('countryFlag'),
  countryEmoji: document.getElementById('countryEmoji'),
  particles:    document.getElementById('particles'),
};

// === Estado ===
let isFetching = false;
let currentThemeIndex = 0;

// =====================
// Utilidades
// =====================

/** Actualiza el indicador de estado */
function setStatus(status, message) {
  el.statusBar.setAttribute('data-status', status);
  el.statusText.textContent = message;
}

/** Formatea hora legible */
function formatTime() {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date());
}

/** Resetea los campos geo al estado inicial */
function resetGeoFields() {
  const dash = '—';
  el.geoContinent.textContent = dash;
  el.geoCity.textContent = dash;
  el.geoCountry.textContent = dash;
  el.geoTime.textContent = dash;
  el.geoISP.textContent = dash;
  el.geoTimezone.textContent = dash;
  el.geoCurrency.textContent = dash;
  el.countryFlag.style.display = 'none';
  el.countryEmoji.textContent = '';
}

// =====================
// API: Obtener IP + Geolocation
// =====================

/**
 * Obtiene la IP desde ipify y luego consulta ipgeolocation.io.
 * Muestra los datos en el DOM e imprime en console.log.
 */
async function fetchIPAndGeo() {
  if (isFetching) return;
  isFetching = true;

  // Reset UI
  el.skeleton.classList.remove('hidden');
  el.ipValue.classList.remove('visible', 'error-message');
  el.ipValue.textContent = '';
  el.btnRefresh.disabled = true;
  el.btnRefresh.classList.add('loading');
  resetGeoFields();
  setStatus('loading', 'Obteniendo IP...');

  try {
    // --- Paso 1: Obtener IP de ipify ---
    const ipResponse = await fetch(IPIFY_URL);
    if (!ipResponse.ok) throw new Error(`ipify HTTP ${ipResponse.status}`);

    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    if (!ip) throw new Error('ipify no retornó la propiedad "ip".');

    console.log(`[Web-API] IP pública obtenida: ${ip}`);

    // Mostrar IP en la interfaz
    el.skeleton.classList.add('hidden');
    el.ipValue.textContent = ip;
    el.ipValue.classList.remove('error-message');
    requestAnimationFrame(() => el.ipValue.classList.add('visible'));

    setStatus('loading', 'Obteniendo geolocalización...');

    // --- Paso 2: Consultar geolocation con esa IP ---
    const geoUrl = `${GEO_BASE}?apiKey=${GEO_API_KEY}&ip=${ip}`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error(`Geolocation HTTP ${geoResponse.status}`);

    const geo = await geoResponse.json();

    // Imprimir toda la respuesta de geolocation en consola
    console.log('[Web-API] Datos de geolocalización completos:');
    console.log(geo);

    // --- Paso 3: Extraer y mostrar datos ---
    const location = geo.location || {};
    const timezone = geo.time_zone || {};
    const currency = geo.currency || {};
    const asn = geo.asn || {};

    // Continente
    el.geoContinent.textContent = location.continent_name || '—';

    // Ciudad
    el.geoCity.textContent = location.city || '—';

    // País
    el.geoCountry.textContent = location.country_name || '—';

    // Hora local del destino
    if (timezone.current_time) {
      // Formato: "2026-03-07 10:37:38.987+0100"
      const timePart = timezone.current_time.split(' ')[1];
      // Tomar solo HH:MM:SS
      const cleanTime = timePart ? timePart.substring(0, 8) : '—';
      el.geoTime.textContent = cleanTime;
    }

    // ISP / Organización
    el.geoISP.textContent = asn.organization || '—';

    // Zona horaria
    el.geoTimezone.textContent = timezone.name || '—';

    // Moneda
    if (currency.code && currency.symbol) {
      el.geoCurrency.textContent = `${currency.code} (${currency.symbol})`;
    } else {
      el.geoCurrency.textContent = currency.code || '—';
    }

    // Bandera del país
    if (location.country_flag) {
      el.countryFlag.src = location.country_flag;
      el.countryFlag.alt = `Bandera de ${location.country_name || ''}`;
      el.countryFlag.style.display = 'block';
    }

    // Emoji del país
    if (location.country_emoji) {
      el.countryEmoji.textContent = location.country_emoji;
    }

    // Logs adicionales formateados
    console.log(`[Web-API] Continente: ${location.continent_name}`);
    console.log(`[Web-API] Ciudad: ${location.city}`);
    console.log(`[Web-API] País: ${location.country_name}`);
    console.log(`[Web-API] Hora local: ${timezone.current_time}`);
    console.log(`[Web-API] ISP: ${asn.organization}`);
    console.log(`[Web-API] Zona horaria: ${timezone.name}`);
    console.log(`[Web-API] Moneda: ${currency.code} (${currency.symbol})`);

    setStatus('success', 'Datos obtenidos');

  } catch (error) {
    console.error('[Web-API] Error:', error.message);

    el.skeleton.classList.add('hidden');

    // Si no tenemos IP aún, mostrar error ahí
    if (!el.ipValue.textContent) {
      el.ipValue.textContent = 'No se pudo obtener la información';
      el.ipValue.classList.add('error-message');
      requestAnimationFrame(() => el.ipValue.classList.add('visible'));
    }

    setStatus('error', 'Error de conexión');

  } finally {
    isFetching = false;
    el.btnRefresh.disabled = false;
    el.btnRefresh.classList.remove('loading');
  }
}

// =====================
// Temas: Ciclo con botón único
// =====================

/** Aplica el tema por índice */
function applyTheme(index) {
  const theme = THEMES[index];
  const root = document.documentElement;

  // Flash visual al cambiar
  const flash = document.createElement('div');
  flash.className = 'theme-flash';
  document.body.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());

  // Aplicar tema
  root.setAttribute('data-theme', theme.id);
  el.themeLabel.textContent = theme.label;

  // Actualizar ícono según tema
  const icons = {
    sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    flame: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    zap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  };

  const iconEl = el.themeToggle.querySelector('.theme-icon');
  if (iconEl) {
    iconEl.outerHTML = `<span class="theme-icon">${icons[theme.icon]}</span>`;
  }

  // Recrear partículas con nuevo color
  createParticles();
}

/** Cicla al siguiente tema */
function cycleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
  applyTheme(currentThemeIndex);
}

// =====================
// Partículas decorativas
// =====================

function createParticles() {
  el.particles.innerHTML = '';
  const count = window.innerWidth < 768 ? 8 : 15;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${Math.random() * 15 + 10}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    el.particles.appendChild(p);
  }
}

// =====================
// Event Listeners
// =====================

el.btnRefresh.addEventListener('click', fetchIPAndGeo);
el.themeToggle.addEventListener('click', cycleTheme);

// =====================
// Inicialización
// =====================

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentThemeIndex);
  fetchIPAndGeo();
});
