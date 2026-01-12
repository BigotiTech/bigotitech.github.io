/**
 * News Component - Carga y muestra noticias desde JSON
 * Soporta i18n
 */
class BigotiNews extends HTMLElement {
    constructor() {
        super();
        this.news = [];
        this.maxItems = parseInt(this.getAttribute('max')) || 3;
    }

    connectedCallback() {
        this.render(); // Initial placeholder
        this.loadNews();
    }

    async loadNews() {
        const depth = parseInt(this.getAttribute('depth')) || 0;
        const basePath = '../'.repeat(depth);

        try {
            // Wait for i18n to be ready
            if (typeof i18n !== 'undefined') {
                await i18n.init();
                i18n.onLanguageChange(() => this.loadNews());
            }

            const lang = typeof i18n !== 'undefined' ? i18n.getLang() : 'es';

            // Load news data
            const response = await fetch(`${basePath}feature/news/data/${lang}.json`);
            if (!response.ok) throw new Error('Failed to load news');

            const data = await response.json();
            this.news = data.news.slice(0, this.maxItems);
            this.render();
        } catch (error) {
            console.error('Error loading news:', error);
            this.renderEmpty();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const lang = (typeof i18n !== 'undefined' && i18n.initialized) ? i18n.getLang() : 'es';
        const locale = lang === 'es' ? 'es-ES' : 'en-US';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(locale, options);
    }

    t(key, fallback) {
        if (typeof i18n !== 'undefined' && i18n.initialized) {
            return i18n.t(key, fallback);
        }
        return fallback;
    }

    getCategoryLabel(category) {
        const labels = {
            'announcement': this.t('news.categories.announcement', 'Anuncio'),
            'release': this.t('news.categories.release', 'Lanzamiento'),
            'update': this.t('news.categories.update', 'Actualizacion')
        };
        return labels[category] || category;
    }

    render() {
        if (this.news.length === 0) {
            this.innerHTML = `
                <div class="news-loading">
                    <div class="news-loading__spinner"></div>
                </div>
            `;
            return;
        }

        this.innerHTML = `
            <div class="news-grid">
                ${this.news.map(item => `
                    <article class="news-card">
                        <div class="news-card__header">
                            <div class="news-card__meta">
                                <time class="news-card__date" datetime="${item.date}">
                                    ${this.formatDate(item.date)}
                                </time>
                                <span class="news-card__category news-card__category--${item.category}">
                                    ${this.getCategoryLabel(item.category)}
                                </span>
                            </div>
                            <h3 class="news-card__title">${item.title}</h3>
                        </div>
                        <div class="news-card__body">
                            <p class="news-card__summary">${item.summary}</p>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    }

    icon(name, options = {}) {
        if (typeof icons !== 'undefined') {
            return icons.get(name, options);
        }
        return '';
    }

    async loadIcons() {
        if (typeof icons !== 'undefined') {
            await icons.render(this);
        }
    }

    renderEmpty() {
        this.innerHTML = `
            <div class="news-empty">
                <div class="news-empty__icon">${this.icon('newspaper', { size: 48 })}</div>
                <p>No hay noticias disponibles</p>
            </div>
        `;
        this.loadIcons();
    }
}

customElements.define('bigoti-news', BigotiNews);
