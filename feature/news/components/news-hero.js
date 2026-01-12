/**
 * News Hero Component - Hero section para la pagina de noticias con i18n
 */
class BigotiNewsHero extends HTMLElement {
    connectedCallback() {
        this.render();
        this.initI18n();
    }

    async initI18n() {
        if (typeof i18n !== 'undefined') {
            await i18n.init();
            this.render();
            i18n.onLanguageChange(() => this.render());
        }
    }

    t(key, fallback) {
        if (typeof i18n !== 'undefined' && i18n.initialized) {
            return i18n.t(key, fallback);
        }
        return fallback;
    }

    render() {
        this.innerHTML = `
            <section class="hero hero--compact">
                <div class="hero__content">
                    <h1 class="page-title">${this.t('news.pageTitle', 'Noticias')}</h1>
                    <p class="page-subtitle">${this.t('news.pageSubtitle', 'Actualizaciones y novedades de BigotiTech')}</p>
                </div>
            </section>
        `;
    }
}

customElements.define('bigoti-news-hero', BigotiNewsHero);
