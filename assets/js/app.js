/**
 * app.js — Punto de entrada principal.
 * Orquesta los módulos OOP: ApiService, GeoData, UIController,
 * ThemeManager y FaviconLoader.
 *
 * Estructura modular con ES Modules (type="module" en el HTML).
 */

import { ApiService } from './modules/ApiService.js';
import { GeoData } from './modules/GeoData.js';
import { UIController } from './modules/UIController.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { FaviconLoader } from './modules/FaviconLoader.js';

/**
 * App — Clase principal de la aplicación.
 * Coordina servicios, UI y lógica de negocio.
 */
class App {
  constructor() {
    // Instanciar servicios y controladores
    this.apiService = new ApiService();
    this.ui = new UIController();
    this.themeManager = new ThemeManager(
      document.getElementById('themeToggle'),
      document.getElementById('themeLabel'),
      document.getElementById('themeIcon')
    );
this.faviconLoader = new FaviconLoader('./assets/img/Dante.jpeg');

    // Estado
    this.isFetching = false;
  }

  /** Inicializa la aplicación. */
  init() {
    // Cargar favicon dinámicamente
    this.faviconLoader.load();

    // Inicializar tema
    this.themeManager.init();

    // Vincular botón de actualizar
    this.ui.btnRefresh.addEventListener('click', () => this.fetchAll());

    // Primera carga automática
    this.fetchAll();

    console.log('[App] Aplicación Web-API inicializada correctamente.');
  }

  /**
   * Flujo principal: obtiene IP → geolocalización → renderiza.
   */
  async fetchAll() {
    if (this.isFetching) return;
    this.isFetching = true;
    this.ui.showLoading('Obteniendo IP...');

    try {
      // Paso 1: Obtener IP desde ipify
      const ip = await this.apiService.fetchIP();
      console.log(`[App] IP obtenida: ${ip}`);
      this.ui.showIP(ip);

      // Paso 2: Obtener geolocalización
      this.ui.setStatus('loading', 'Obteniendo geolocalización...');
      const rawGeo = await this.apiService.fetchGeolocation(ip);

      // Paso 3: Crear modelo de datos
      const geoData = new GeoData(ip, rawGeo);

      // Paso 4: Imprimir en consola
      geoData.logToConsole();

      // Paso 5: Renderizar UI
      this.ui.renderDataGrid(geoData);
      this.ui.renderSunCard(geoData);
      this.ui.setStatus('success', 'Datos obtenidos');

    } catch (error) {
      console.error('[App] Error:', error.message);
      this.ui.showError('No se pudo obtener la información');
    } finally {
      this.isFetching = false;
      this.ui.enableRefresh();
    }
  }
}

// === Arranque ===
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
