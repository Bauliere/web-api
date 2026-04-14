/**
 * ApiService — Clase encargada de consumir las APIs externas.
 * Patrón: Servicio (Service Layer)
 * Usa fetch con async/await.
 */
export class ApiService {
  /** URLs y configuración */
  static IPIFY_URL = 'https://api.ipify.org?format=json';
  static GEO_BASE = 'https://api.ipgeolocation.io/v3/ipgeo';
  static GEO_API_KEY = '6178dbf74ada4505a763acd4769729b7';

  /**
   * Obtiene la IP pública del cliente desde ipify.
   * @returns {Promise<string>} La dirección IP.
   */
  async fetchIP() {
    const response = await fetch(ApiService.IPIFY_URL);
    if (!response.ok) {
      throw new Error(`ipify HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.ip) throw new Error('ipify no retornó la propiedad "ip".');
    return data.ip;
  }

  /**
   * Obtiene datos de geolocalización para una IP dada.
   * @param {string} ip — Dirección IP a consultar.
   * @returns {Promise<Object>} Respuesta completa de la API.
   */
  async fetchGeolocation(ip) {
    const url = `${ApiService.GEO_BASE}?apiKey=${ApiService.GEO_API_KEY}&ip=${ip}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geolocation HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }
}
