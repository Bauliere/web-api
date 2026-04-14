/**
 * GeoData — Modelo que encapsula los datos de geolocalización.
 * Extrae y estructura los 10+ datos significativos del cliente.
 */
export class GeoData {
  /**
   * @param {string} ip — Dirección IP pública.
   * @param {Object} raw — Respuesta cruda de ipgeolocation.io.
   */
  constructor(ip, raw) {
    this.ip = ip;
    this.raw = raw;

    // Desestructurar secciones
    const loc = raw.location || {};
    const tz = raw.time_zone || {};
    const cur = raw.currency || {};
    const asn = raw.asn || {};
    const meta = raw.country_metadata || {};

    // --- 10 Datos significativos de conexión ---
    this.continent = loc.continent_name || '—';
    this.city = loc.city || '—';
    this.country = loc.country_name || '—';
    this.countryCode = loc.country_code2 || '';
    this.region = loc.state_prov || '—';
    this.latitude = loc.latitude || '—';
    this.longitude = loc.longitude || '—';
    this.isp = asn.organization || '—';
    this.timezone = tz.name || '—';
    this.currency = cur.code
      ? `${cur.code} (${cur.symbol || ''})`
      : '—';

    // Hora local
    this.localTime = this._extractTime(tz.current_time);

    // Bandera e ícono
    this.flagUrl = loc.country_flag || '';
    this.emoji = loc.country_emoji || '';

    // Datos extra
    this.callingCode = meta.calling_code || '—';
    this.tld = meta.tld || '—';

    // --- DST: Salida y puesta de sol (aproximación) ---
    this.dstStart = tz.dst_start || null;
    this.dstEnd = tz.dst_end || null;
    this.sunriseEstimate = this._estimateSunrise(tz);
    this.sunsetEstimate = this._estimateSunset(tz);
  }

  /**
   * Extrae HH:MM:SS de un string tipo "2026-03-07 10:37:38.987+0100"
   */
  _extractTime(timeStr) {
    if (!timeStr) return '—';
    const parts = timeStr.split(' ');
    if (parts.length < 2) return '—';
    return parts[1].substring(0, 8);
  }

  /**
   * Estima la hora de salida del sol basándose en dst_start.
   * Si dst_start existe, usa la hora de transición como referencia.
   * Aproximación: el sol sale cuando el DST "salta" hacia adelante.
   */
  _estimateSunrise(tz) {
    if (tz.dst_start && tz.dst_start.date_time_after) {
      // Formato: "2026-03-29 TIME 03:00" → extraer hora
      const str = tz.dst_start.date_time_after.replace('TIME ', '');
      const parts = str.split(' ');
      if (parts.length >= 2) {
        return parts[1]; // "03:00"
      }
    }
    // Fallback basado en offset
    const offset = tz.offset_with_dst ?? tz.offset ?? 0;
    const baseHour = 6; // Base sunrise ~6:00 UTC
    const localHour = (baseHour + offset + 24) % 24;
    return `${String(localHour).padStart(2, '0')}:00`;
  }

  /**
   * Estima la hora de puesta del sol basándose en dst_end.
   * Si dst_end existe, usa la hora de transición como referencia.
   */
  _estimateSunset(tz) {
    if (tz.dst_end && tz.dst_end.date_time_before) {
      const str = tz.dst_end.date_time_before.replace('TIME ', '');
      const parts = str.split(' ');
      if (parts.length >= 2) {
        return parts[1]; // "03:00" → se interpreta como hora de "caída"
      }
    }
    // Fallback basado en offset
    const offset = tz.offset_with_dst ?? tz.offset ?? 0;
    const baseHour = 18; // Base sunset ~18:00 UTC
    const localHour = (baseHour + offset + 24) % 24;
    return `${String(localHour).padStart(2, '0')}:00`;
  }

  /**
   * Retorna un array con los 10 datos principales para renderizar.
   * Cada item: { icon, label, value }
   */
  getDataItems() {
    return [
      { icon: 'bi-globe-americas', label: 'Continente', value: this.continent },
      { icon: 'bi-geo-alt-fill', label: 'Ciudad', value: this.city },
      { icon: 'bi-flag-fill', label: 'País', value: this.country },
      { icon: 'bi-map', label: 'Región / Estado', value: this.region },
      { icon: 'bi-pin-map-fill', label: 'Latitud', value: this.latitude },
      { icon: 'bi-pin-map', label: 'Longitud', value: this.longitude },
      { icon: 'bi-clock-fill', label: 'Hora local', value: this.localTime },
      { icon: 'bi-hdd-network-fill', label: 'ISP', value: this.isp },
      { icon: 'bi-clock-history', label: 'Zona horaria', value: this.timezone },
      { icon: 'bi-currency-exchange', label: 'Moneda', value: this.currency },
    ];
  }

  /**
   * Imprime toda la información en la consola.
   */
  logToConsole() {
    console.group('[Web-API] Datos de geolocalización');
    console.log('IP:', this.ip);
    console.log('Continente:', this.continent);
    console.log('Ciudad:', this.city);
    console.log('País:', this.country);
    console.log('Región:', this.region);
    console.log('Latitud:', this.latitude);
    console.log('Longitud:', this.longitude);
    console.log('Hora local:', this.localTime);
    console.log('ISP:', this.isp);
    console.log('Zona horaria:', this.timezone);
    console.log('Moneda:', this.currency);
    console.log('Salida del sol (est.):', this.sunriseEstimate);
    console.log('Puesta del sol (est.):', this.sunsetEstimate);
    console.log('Respuesta completa:', this.raw);
    console.groupEnd();
  }
}
