/**
 * BigotiTech i18n System
 * Sistema de internacionalización para el sitio web
 */

// Check for file:// protocol issue
if (window.location.protocol === 'file:') {
    console.warn('[i18n] WARNING: Running from file:// protocol. fetch() may not work.');
    console.warn('[i18n] Please use a local web server (e.g., Live Server in VS Code) or host on a server.');
}

class I18n {
    constructor() {
        this.defaultLang = 'es';
        this.supportedLangs = ['es', 'en'];
        this.currentLang = null;
        this.translations = {};
        this.basePath = null;
        this.listeners = [];
        this.initialized = false;
        this.translationsLoaded = false;
    }

    /**
     * Detecta la ruta base hacia la carpeta bigotitech
     * Usa data-base-path si está definido, sino calcula desde depth
     */
    detectBasePath() {
        // Primero intenta usar data-base-path (ruta directa a bigotitech/)
        const basePath = document.body?.dataset?.basePath;
        if (basePath) {
            return basePath;
        }
        // Fallback: usa depth para calcular (compatibilidad)
        const depth = document.body?.dataset?.depth || '0';
        return '../'.repeat(parseInt(depth));
    }

    /**
     * Detecta el idioma preferido del usuario
     * Prioridad: URL param > localStorage > navigator > default
     */
    detectLanguage() {
        // 1. URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLangs.includes(urlLang)) {
            return urlLang;
        }

        // 2. localStorage
        const storedLang = localStorage.getItem('bigotitech-lang');
        if (storedLang && this.supportedLangs.includes(storedLang)) {
            return storedLang;
        }

        // 3. Navigator language
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLangs.includes(browserLang)) {
            return browserLang;
        }

        // 4. Default
        return this.defaultLang;
    }

    /**
     * Inicializa el sistema i18n
     */
    async init() {
        if (this.initialized) {
            return this;
        }
        this.basePath = this.detectBasePath();
        console.log(`[i18n] Base path detected: "${this.basePath}"`);

        this.currentLang = this.detectLanguage();
        console.log(`[i18n] Language detected: ${this.currentLang}`);

        const loaded = await this.loadTranslations(this.currentLang);
        this.translationsLoaded = loaded;
        this.initialized = true;

        if (loaded) {
            this.saveLangPreference(this.currentLang);
            console.log(`[i18n] Initialized successfully`);
        } else {
            console.error(`[i18n] Initialized but translations not loaded - fallbacks will be used`);
        }
        return this;
    }

    /**
     * Carga las traducciones de un idioma
     * @returns {boolean} true si cargó correctamente
     */
    async loadTranslations(lang) {
        try {
            const url = `${this.basePath}core/i18n/${lang}.json`;
            console.log(`[i18n] Loading translations from: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang} (${response.status})`);
            }
            this.translations = await response.json();
            this.currentLang = lang;
            console.log(`[i18n] Translations loaded successfully for: ${lang}`);
            return true;
        } catch (error) {
            console.error(`[i18n] Error loading translations:`, error);
            // Fallback al idioma por defecto si falla
            if (lang !== this.defaultLang) {
                console.log(`[i18n] Trying fallback language: ${this.defaultLang}`);
                return await this.loadTranslations(this.defaultLang);
            }
            return false;
        }
    }

    /**
     * Cambia el idioma actual
     */
    async setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`Language ${lang} is not supported`);
            return;
        }

        if (lang === this.currentLang) {
            return;
        }

        await this.loadTranslations(lang);
        this.saveLangPreference(lang);
        this.notifyListeners();

        // Actualizar la URL sin recargar
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
    }

    /**
     * Guarda la preferencia de idioma
     */
    saveLangPreference(lang) {
        localStorage.setItem('bigotitech-lang', lang);
    }

    /**
     * Obtiene una traducción por clave
     * Soporta claves anidadas: 'nav.about'
     * Soporta interpolación: '{year}' -> 2026
     * @param {string} key - Clave de traducción
     * @param {string|Object} fallbackOrParams - Fallback string o parámetros de interpolación
     * @param {Object} params - Parámetros de interpolación (si fallback es string)
     */
    t(key, fallbackOrParams = {}, params = {}) {
        // Determinar si el segundo parámetro es fallback o params
        let fallback = null;
        let interpolationParams = {};

        if (typeof fallbackOrParams === 'string') {
            fallback = fallbackOrParams;
            interpolationParams = params;
        } else {
            interpolationParams = fallbackOrParams;
        }

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Si hay fallback, usarlo; si no, retornar la clave
                if (fallback !== null) {
                    return fallback;
                }
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof value !== 'string') {
            if (fallback !== null) {
                return fallback;
            }
            console.warn(`Translation value is not a string: ${key}`);
            return key;
        }

        // Interpolación de parámetros
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return interpolationParams[paramKey] !== undefined ? interpolationParams[paramKey] : match;
        });
    }

    /**
     * Obtiene el idioma actual
     */
    getLang() {
        return this.currentLang;
    }

    /**
     * Obtiene todos los idiomas soportados
     */
    getSupportedLangs() {
        return this.supportedLangs;
    }

    /**
     * Obtiene información del idioma actual
     */
    getLangInfo() {
        return this.translations.meta || { lang: this.currentLang };
    }

    /**
     * Registra un listener para cambios de idioma
     */
    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notifica a todos los listeners de un cambio de idioma
     */
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentLang));
    }

    /**
     * Traduce todos los elementos con data-i18n en el DOM
     */
    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const params = element.dataset.i18nParams
                ? JSON.parse(element.dataset.i18nParams)
                : {};
            element.textContent = this.t(key, params);
        });

        // Traducir atributos
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrs = JSON.parse(element.dataset.i18nAttr);
            for (const [attr, key] of Object.entries(attrs)) {
                element.setAttribute(attr, this.t(key));
            }
        });

        // Actualizar el atributo lang del HTML
        document.documentElement.lang = this.currentLang;
    }
}

// Instancia global
const i18n = new I18n();

// Exportar para uso en módulos y global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
}

// Hacer disponible globalmente
window.i18n = i18n;
window.I18n = I18n;
