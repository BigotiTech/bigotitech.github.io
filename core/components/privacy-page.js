/**
 * Privacy Page Component - Renderiza politica de privacidad desde JSON
 */
class BigotiPrivacy extends HTMLElement {
    connectedCallback() {
        const depth = this.getAttribute('depth') || '0';
        const appId = this.getAttribute('app-id');

        this.depth = parseInt(depth);
        this.appId = appId;
        this.basePath = '../'.repeat(this.depth);
        this.privacyData = null;

        this.render(); // Render placeholder
        this.loadData();
    }

    async loadData() {
        try {
            // Wait for i18n to be ready
            if (typeof i18n !== 'undefined') {
                await i18n.init();
                i18n.onLanguageChange(() => this.loadData());
            }

            const lang = typeof i18n !== 'undefined' ? i18n.getLang() : 'es';

            // Load privacy data using dataLoader or fetch directly
            if (typeof dataLoader !== 'undefined') {
                this.privacyData = await dataLoader.loadPrivacyData(this.appId, lang);
            } else {
                const response = await fetch(`${this.basePath}privacy/${this.appId}/data/${lang}.json`);
                this.privacyData = await response.json();
            }

            this.render();
            this.updateMeta();
        } catch (error) {
            console.error('Error loading privacy data:', error);
            this.renderError();
        }
    }

    t(key, fallback) {
        if (typeof i18n !== 'undefined' && i18n.initialized) {
            return i18n.t(key, fallback);
        }
        return fallback;
    }

    updateMeta() {
        if (!this.privacyData) return;

        // Update page title
        document.title = `${this.t('privacy.pageTitle', 'Politica de Privacidad')} - ${this.privacyData.appName} | BigotiTech`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.privacyData.meta?.metaDescription ||
                `Politica de Privacidad de ${this.privacyData.appName} - BigotiTech`;
        }
    }

    render() {
        if (!this.privacyData) {
            this.innerHTML = `
                <div class="privacy-loading">
                    <div class="privacy-loading__spinner"></div>
                </div>
            `;
            return;
        }

        const data = this.privacyData;
        const pageTitle = this.t('privacy.pageTitle', 'Politica de Privacidad');
        const lastUpdatedLabel = this.t('privacy.lastUpdated', 'Ultima actualizacion');

        // Build sections
        const sectionsHtml = data.sections.map(section => {
            let content = `
                <article class="card">
                    <h2 class="card__title">${section.title}</h2>
                    ${section.content}
            `;

            // Add contact box if this section has contact info
            if (section.hasContact && data.contact) {
                content += `
                    <div class="contact-box">
                        <span class="contact-box__icon">✉</span>
                        <div class="contact-box__content">
                            <p class="contact-box__label">Email</p>
                            <a href="mailto:${data.contact.email}" class="contact-box__email">${data.contact.email}</a>
                        </div>
                    </div>
                `;
            }

            content += `</article>`;
            return content;
        }).join('');

        this.innerHTML = `
            <section class="hero hero--compact">
                <div class="hero__decorations">
                    <div class="hero__circle hero__circle--1"></div>
                    <div class="hero__circle hero__circle--2"></div>
                    <div class="hero__circle hero__circle--3"></div>
                    <div class="hero__circle hero__circle--4"></div>
                    <div class="hero__dice hero__dice--1"></div>
                    <div class="hero__dice hero__dice--2"></div>
                    <div class="hero__square hero__square--1"></div>
                    <div class="hero__square hero__square--2"></div>
                    <div class="hero__square hero__square--3"></div>
                    <div class="hero__square hero__square--4"></div>
                </div>
                <div class="hero__content">
                    <h1 class="page-title">${pageTitle}</h1>
                    <p class="page-subtitle">${data.appName} · ${lastUpdatedLabel}: ${data.lastUpdatedFormatted}</p>
                </div>
            </section>

            <main class="content content--compact">
                <div class="container container--narrow">
                    <div class="card card--intro">
                        <p>${data.intro}</p>
                    </div>

                    ${sectionsHtml}
                </div>
            </main>
        `;
    }

    renderError() {
        const isFileProtocol = window.location.protocol === 'file:';
        const errorMessage = isFileProtocol
            ? 'Error al cargar los datos. Por favor, usa un servidor web local (ej: Live Server en VS Code).'
            : 'Error al cargar la politica de privacidad';

        this.innerHTML = `
            <div class="privacy-error">
                <p>${errorMessage}</p>
                ${isFileProtocol ? '<p style="font-size: 0.9em; opacity: 0.8;">El protocolo file:// no permite cargar archivos JSON.</p>' : ''}
            </div>
        `;
    }
}

customElements.define('bigoti-privacy', BigotiPrivacy);
