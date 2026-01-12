/**
 * Footer Component - Reutilizable en todas las paginas
 * Soporta i18n
 */
class BigotiFooter extends HTMLElement {
    connectedCallback() {
        // Usa data-base-path si está disponible, sino calcula desde depth
        const bodyBasePath = document.body?.dataset?.basePath;
        const depth = this.getAttribute('depth') || '0';
        const basePath = bodyBasePath || '../'.repeat(parseInt(depth));

        this.basePath = basePath;
        this.id = 'contacto';

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

    render() {
        const basePath = this.basePath;

        const t = (key, fallback) => {
            if (typeof i18n !== 'undefined' && i18n.initialized) {
                return i18n.t(key, fallback);
            }
            return fallback;
        };

        const year = new Date().getFullYear();
        const copyrightText = t('footer.copyright', `© ${year} BigotiTech. Todos los derechos reservados.`)
            .replace('{year}', year);

        this.innerHTML = `
            <div class="footer__container">
                <div class="footer__main">
                    <div class="footer__brand">
                        <div class="footer__logo">
                            <img src="${basePath}core/assets/brand/logo-bigotitech.png" alt="BigotiTech" class="footer__logo-img">
                            <span class="footer__logo-text">Bigoti<span>Tech</span></span>
                        </div>
                        <p class="footer__tagline">${t('footer.tagline', 'Creando experiencias digitales unicas')}</p>
                    </div>

                    <div class="footer__contact">
                        <div class="footer__contact-item">
                            <span class="footer__contact-icon">✉</span>
                            <a href="mailto:${t('footer.email', 'bigotitech@gmail.com')}">${t('footer.email', 'bigotitech@gmail.com')}</a>
                        </div>
                    </div>
                </div>

                <div class="footer__bottom">
                    <p class="footer__copyright">${copyrightText}</p>
                </div>
            </div>
        `;
    }
}

customElements.define('bigoti-footer', BigotiFooter);
