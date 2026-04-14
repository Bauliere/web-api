/**
 * FaviconLoader — Carga el favicon dinámicamente con JavaScript.
 * Crea un <link rel="icon"> en el <head> apuntando a la imagen indicada.
 */
export class FaviconLoader {
  /**
   * @param {string} imagePath — Ruta relativa a la imagen del favicon.
   */
  constructor(imagePath) {
    this.imagePath = imagePath;
  }

  /** Inyecta el favicon en el DOM. */
  load() {
    // Eliminar favicons previos
    const existing = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existing.forEach(el => el.remove());

    // Crear nuevo link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/jpeg';
    link.href = this.imagePath;
    document.head.appendChild(link);

    console.log(`[FaviconLoader] Favicon cargado dinámicamente: ${this.imagePath}`);
  }
}
