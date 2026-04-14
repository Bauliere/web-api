/**
 * ThemeManager — Gestiona el ciclo de temas de la aplicación.
 * Patrón: Singleton conceptual (una instancia por app).
 */
export class ThemeManager {
  /** Definición de los 3 temas */
  static THEMES = [
    { id: 'sakura',     label: 'Sakura',     iconClass: 'bi-flower1' },
    { id: 'vino',       label: 'Vino',       iconClass: 'bi-fire' },
    { id: 'evangelion', label: 'Evangelion',  iconClass: 'bi-lightning-charge-fill' },
  ];

  /**
   * @param {HTMLElement} toggleBtn — Botón que activa el ciclo.
   * @param {HTMLElement} labelEl — Elemento que muestra el nombre del tema.
   * @param {HTMLElement} iconEl — Elemento <i> del ícono.
   */
  constructor(toggleBtn, labelEl, iconEl) {
    this.toggleBtn = toggleBtn;
    this.labelEl = labelEl;
    this.iconEl = iconEl;
    this.currentIndex = 0;

    // Vincular evento
    this.toggleBtn.addEventListener('click', () => this.cycle());
  }

  /** Aplica un tema por índice. */
  apply(index) {
    const theme = ThemeManager.THEMES[index];
    const root = document.documentElement;

    // Flash de transición visual
    const flash = document.createElement('div');
    flash.className = 'theme-flash';
    document.body.appendChild(flash);
    flash.addEventListener('animationend', () => flash.remove());

    // Aplicar atributo
    root.setAttribute('data-theme', theme.id);

    // Actualizar label e ícono
    this.labelEl.textContent = theme.label;
    this.iconEl.className = `bi ${theme.iconClass}`;

    // Recrear partículas
    this._refreshParticles();
  }

  /** Cicla al siguiente tema. */
  cycle() {
    this.currentIndex = (this.currentIndex + 1) % ThemeManager.THEMES.length;
    this.apply(this.currentIndex);
  }

  /** Inicializa con el primer tema. */
  init() {
    this.apply(this.currentIndex);
  }

  /** Genera partículas decorativas. */
  _refreshParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    const count = window.innerWidth < 768 ? 8 : 14;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 5 + 3;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${Math.random() * 14 + 10}s`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      container.appendChild(p);
    }
  }
}
