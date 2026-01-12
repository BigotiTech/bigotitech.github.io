/**
 * Icon System - Carga y gestiona iconos SVG de forma reutilizable
 */
const icons = {
    cache: {},
    basePath: '',

    /**
     * Inicializa el sistema de iconos
     * @param {string} basePath - Ruta base para los iconos
     */
    init(basePath = '') {
        this.basePath = basePath;
    },

    /**
     * Obtiene el HTML de un icono SVG
     * @param {string} name - Nombre del icono (sin extension)
     * @param {object} options - Opciones de personalizacion
     * @returns {string} HTML del icono
     */
    get(name, options = {}) {
        const {
            size = 24,
            className = '',
            ariaLabel = ''
        } = options;

        const ariaAttr = ariaLabel
            ? `aria-label="${ariaLabel}" role="img"`
            : 'aria-hidden="true"';

        return `<span class="icon ${className}" data-icon="${name}" ${ariaAttr} style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;"></span>`;
    },

    /**
     * Carga un icono SVG desde archivo
     * @param {string} name - Nombre del icono
     * @returns {Promise<string>} Contenido SVG
     */
    async load(name) {
        if (this.cache[name]) {
            return this.cache[name];
        }

        try {
            const response = await fetch(`${this.basePath}core/assets/${name}.svg`);
            if (!response.ok) throw new Error(`Icon not found: ${name}`);

            const svg = await response.text();
            this.cache[name] = svg;
            return svg;
        } catch (error) {
            console.warn(`Icon '${name}' not found, using fallback`);
            return this.getFallback(name);
        }
    },

    /**
     * Renderiza todos los iconos pendientes en un elemento
     * @param {HTMLElement} container - Contenedor donde buscar iconos
     */
    async render(container = document) {
        const iconSpans = container.querySelectorAll('.icon[data-icon]');

        const loadPromises = Array.from(iconSpans).map(async (span) => {
            const iconName = span.dataset.icon;
            if (!iconName || span.querySelector('svg')) return;

            const svg = await this.load(iconName);
            span.innerHTML = svg;

            // Aplicar estilos al SVG
            const svgEl = span.querySelector('svg');
            if (svgEl) {
                svgEl.style.width = '100%';
                svgEl.style.height = '100%';
            }
        });

        await Promise.all(loadPromises);
    },

    /**
     * Obtiene un icono SVG inline (sincrono, usa cache)
     * @param {string} name - Nombre del icono
     * @returns {string} SVG o placeholder
     */
    inline(name) {
        return this.cache[name] || this.getFallback(name);
    },

    /**
     * Precarga iconos para uso posterior
     * @param {string[]} names - Lista de nombres de iconos
     */
    async preload(names) {
        await Promise.all(names.map(name => this.load(name)));
    },

    /**
     * Fallback para iconos no encontrados
     * @param {string} name - Nombre del icono
     * @returns {string} SVG placeholder
     */
    getFallback(name) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    },

    /**
     * Mapeo de iconos para features y plataformas
     */
    mapping: {
        // Plataformas
        'web': 'globe',
        'android': 'smartphone',
        'ios': 'apple',
        'windows': 'desktop',
        'mac': 'monitor',
        'linux': 'linux',

        // Features
        'chart-bar': 'chart-bar',
        'chart-line': 'chart-line',
        'target': 'target',
        'lock': 'lock',
        'sparkles': 'sparkles',
        'gem': 'gem',
        'dice': 'dice',
        'users': 'users',
        'ban': 'ban',
        'wifi-off': 'wifi-off',
        'globe': 'globe',

        // About
        'mission': 'target',
        'vision': 'eye',
        'values': 'gem',

        // Team
        'developer': 'code',
        'designer': 'palette',
        'game-designer': 'gamepad',

        // Misc
        'news': 'newspaper',
        'package': 'package',
        'arrow-left': 'arrow-left',
        'arrow-right': 'arrow-right'
    },

    /**
     * Obtiene el nombre de archivo del icono mapeado
     * @param {string} key - Clave del mapeo
     * @returns {string} Nombre del archivo de icono
     */
    getMapped(key) {
        return this.mapping[key] || key;
    }
};

// Exportar para uso global
window.icons = icons;
