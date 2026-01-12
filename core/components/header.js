/**
 * Header Component - Reutilizable en todas las paginas
 * Soporta i18n y selector de idioma
 */
class BigotiHeader extends HTMLElement {
    connectedCallback() {
        // Usa data-base-path si está disponible, sino calcula desde depth
        const bodyBasePath = document.body?.dataset?.basePath;
        const bodyRootPath = document.body?.dataset?.rootPath;
        const depth = this.getAttribute('depth') || '0';
        const basePath = bodyBasePath || '../'.repeat(parseInt(depth));
        const rootPath = bodyRootPath !== undefined ? bodyRootPath : '../'.repeat(parseInt(depth));
        const isHome = this.hasAttribute('home');

        // Store paths for later use
        this.basePath = basePath;
        this.rootPath = rootPath;
        this.isHome = isHome;

        // Initial render with default texts
        this.render();

        // Wait for i18n to be ready and re-render
        this.initI18n();
    }

    async initI18n() {
        // Wait for i18n to be available
        if (typeof i18n !== 'undefined') {
            await i18n.init();
            this.render();

            // Listen for language changes
            i18n.onLanguageChange(() => this.render());
        }
    }

    render() {
        const basePath = this.basePath;
        const rootPath = this.rootPath;
        const isHome = this.isHome;

        // Get translations or use defaults
        const t = (key, fallback) => {
            if (typeof i18n !== 'undefined' && i18n.initialized) {
                return i18n.t(key, fallback);
            }
            return fallback;
        };

        const currentLang = (typeof i18n !== 'undefined' && i18n.initialized) ? i18n.getLang() : 'es';
        const langs = typeof i18n !== 'undefined' ? i18n.getSupportedLangs() : ['es', 'en'];

        this.innerHTML = `
            <nav class="header__nav">
                <a href="${isHome ? '#' : rootPath}" class="header__logo">
                    <img src="${basePath}core/assets/brand/logo-bigotitech.png" alt="BigotiTech" class="header__logo-img">
                    <span class="header__logo-text">Bigoti<span>Tech</span></span>
                </a>

                <button class="header__hamburger" aria-label="Abrir menú" aria-expanded="false">
                    <span class="header__hamburger-line"></span>
                    <span class="header__hamburger-line"></span>
                    <span class="header__hamburger-line"></span>
                </button>

                <div class="header__mobile-menu">
                    <ul class="header__menu">
                        <li><a href="${isHome ? '#about' : rootPath + '#about'}" class="header__link">${t('nav.about', 'Nosotros')}</a></li>
                        <li><a href="${isHome ? '#apps' : rootPath + '#apps'}" class="header__link">${t('nav.apps', 'Apps')}</a></li>
                        <li><a href="${isHome ? '#team' : rootPath + '#team'}" class="header__link">${t('nav.team', 'Equipo')}</a></li>
                        <li><a href="${rootPath}feature/news/" class="header__link">${t('nav.news', 'Noticias')}</a></li>
                    </ul>
                    <div class="header__lang">
                        <button class="header__lang-btn" aria-label="Cambiar idioma">
                            <span class="header__lang-current">${currentLang.toUpperCase()}</span>
                            <svg class="header__lang-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <div class="header__lang-dropdown">
                            ${langs.map(lang => `
                                <button class="header__lang-option ${lang === currentLang ? 'header__lang-option--active' : ''}"
                                        data-lang="${lang}">
                                    ${lang.toUpperCase()}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </nav>
        `;

        this.setupLangSelector();
        this.setupMobileMenu();
    }

    setupLangSelector() {
        const langBtn = this.querySelector('.header__lang-btn');
        const langDropdown = this.querySelector('.header__lang-dropdown');
        const langOptions = this.querySelectorAll('.header__lang-option');

        if (!langBtn) return;

        // Toggle dropdown
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('header__lang-dropdown--open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            langDropdown.classList.remove('header__lang-dropdown--open');
        });

        // Handle language selection
        langOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;
                if (typeof i18n !== 'undefined') {
                    await i18n.setLanguage(lang);
                }
                langDropdown.classList.remove('header__lang-dropdown--open');
            });
        });
    }

    setupMobileMenu() {
        const hamburger = this.querySelector('.header__hamburger');
        const mobileMenu = this.querySelector('.header__mobile-menu');
        const menuLinks = this.querySelectorAll('.header__link');

        if (!hamburger || !mobileMenu) return;

        // Toggle mobile menu
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('header__mobile-menu--open');
            hamburger.classList.toggle('header__hamburger--active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.classList.toggle('menu-open', isOpen);
        });

        // Close menu when clicking a link
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('header__mobile-menu--open');
                hamburger.classList.remove('header__hamburger--active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                mobileMenu.classList.remove('header__mobile-menu--open');
                hamburger.classList.remove('header__hamburger--active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

customElements.define('bigoti-header', BigotiHeader);
