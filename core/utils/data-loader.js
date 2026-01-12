/**
 * BigotiTech Data Loader
 * Sistema de carga de datos JSON con cache
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.basePath = null;
    }

    /**
     * Detecta la ruta base hacia la carpeta bigotitech
     * Usa data-base-path si está definido, sino calcula desde depth
     */
    detectBasePath() {
        if (this.basePath === null) {
            // Primero intenta usar data-base-path (ruta directa a bigotitech/)
            const basePath = document.body?.dataset?.basePath;
            if (basePath) {
                this.basePath = basePath;
            } else {
                // Fallback: usa depth para calcular (compatibilidad)
                const depth = document.body?.dataset?.depth || '0';
                this.basePath = '../'.repeat(parseInt(depth));
            }
        }
        return this.basePath;
    }

    /**
     * Genera una clave de cache única
     */
    getCacheKey(path, lang) {
        return `${path}:${lang}`;
    }

    /**
     * Carga datos JSON desde una ruta
     * @param {string} path - Ruta relativa al basePath
     * @param {Object} options - Opciones de carga
     * @param {boolean} options.useCache - Usar cache (default: true)
     * @param {string} options.lang - Idioma para cargar (reemplaza {lang} en path)
     */
    async load(path, options = {}) {
        const { useCache = true, lang = null } = options;

        // Reemplazar {lang} en la ruta si se proporciona idioma
        let finalPath = path;
        if (lang) {
            finalPath = path.replace('{lang}', lang);
        }

        const cacheKey = this.getCacheKey(finalPath, lang);

        // Verificar cache
        if (useCache && this.cache.has(cacheKey)) {
            console.log(`[DataLoader] Cache hit: ${finalPath}`);
            return this.cache.get(cacheKey);
        }

        try {
            const basePath = this.detectBasePath();
            const url = `${basePath}${finalPath}`;
            console.log(`[DataLoader] Loading: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load: ${finalPath} (${response.status})`);
            }
            const data = await response.json();

            // Guardar en cache
            if (useCache) {
                this.cache.set(cacheKey, data);
            }

            console.log(`[DataLoader] Loaded successfully: ${finalPath}`);
            return data;
        } catch (error) {
            console.error(`[DataLoader] Error loading ${path}:`, error);
            throw error;
        }
    }

    /**
     * Carga datos de una aplicación
     * @param {string} appId - ID de la aplicación
     * @param {string} lang - Idioma
     */
    async loadAppData(appId, lang) {
        return this.load(`feature/applications/${appId}/data/${lang}.json`);
    }

    /**
     * Carga datos de política de privacidad
     * @param {string} appId - ID de la aplicación
     * @param {string} lang - Idioma
     */
    async loadPrivacyData(appId, lang) {
        return this.load(`feature/applications/${appId}/privacy/${lang}.json`);
    }

    /**
     * Carga la lista de noticias
     * @param {string} lang - Idioma
     */
    async loadNews(lang) {
        return this.load(`feature/news/data/${lang}.json`);
    }

    /**
     * Carga datos del equipo
     * @param {string} lang - Idioma
     */
    async loadTeam(lang) {
        return this.load(`assets/data/team/${lang}.json`);
    }

    /**
     * Carga la lista de aplicaciones
     */
    async loadAppsList() {
        return this.load(`assets/data/apps.json`);
    }

    /**
     * Precarga múltiples recursos
     * @param {Array<{path: string, lang?: string}>} resources
     */
    async preload(resources) {
        const promises = resources.map(resource =>
            this.load(resource.path, { lang: resource.lang })
                .catch(err => {
                    console.warn(`Preload failed for ${resource.path}:`, err);
                    return null;
                })
        );
        return Promise.all(promises);
    }

    /**
     * Limpia el cache
     * @param {string} [pattern] - Patrón de clave a limpiar (opcional)
     */
    clearCache(pattern) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    /**
     * Obtiene el tamaño del cache
     */
    getCacheSize() {
        return this.cache.size;
    }
}

// Instancia global
const dataLoader = new DataLoader();

// Exportar para uso en módulos y global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataLoader, dataLoader };
}

// Hacer disponible globalmente
window.dataLoader = dataLoader;
window.DataLoader = DataLoader;
