/**
 * Home Content Component - Renderiza el contenido del home con i18n
 */
class BigotiHomeContent extends HTMLElement {
    connectedCallback() {
        this.initIcons();
        this.render();
        this.initI18n();
    }

    initIcons() {
        if (typeof icons !== 'undefined') {
            icons.init('');
        }
    }

    async initI18n() {
        if (typeof i18n !== 'undefined') {
            await i18n.init();
            this.render();
            await this.loadIcons();
            this.setupFilters();
            i18n.onLanguageChange(async () => {
                this.render();
                await this.loadIcons();
                this.setupFilters();
            });
        } else {
            await this.loadIcons();
            this.setupFilters();
        }
    }

    setupFilters() {
        const filterBtns = this.querySelectorAll('.projects-filter');
        const projects = this.querySelectorAll('.app-modern');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('projects-filter--active'));
                btn.classList.add('projects-filter--active');

                // Filter projects
                const filter = btn.dataset.filter;
                projects.forEach(project => {
                    if (filter === 'all' || project.dataset.type === filter) {
                        project.style.display = '';
                        project.classList.remove('app-modern--hidden');
                    } else {
                        project.classList.add('app-modern--hidden');
                        setTimeout(() => {
                            if (project.classList.contains('app-modern--hidden')) {
                                project.style.display = 'none';
                            }
                        }, 300);
                    }
                });
            });
        });
    }

    async loadIcons() {
        if (typeof icons !== 'undefined') {
            await icons.render(this);
        }
    }

    t(key, fallback) {
        if (typeof i18n !== 'undefined' && i18n.initialized) {
            return i18n.t(key, fallback);
        }
        return fallback;
    }

    icon(name, options = {}) {
        if (typeof icons !== 'undefined') {
            return icons.get(name, options);
        }
        return '';
    }

    render() {
        this.innerHTML = `
            <section class="hero">
                <div class="hero__decorations">
                    <div class="hero__circle hero__circle--1"></div>
                    <div class="hero__circle hero__circle--2"></div>
                    <div class="hero__circle hero__circle--3"></div>
                    <div class="hero__circle hero__circle--4"></div>
                    <div class="hero__dice hero__dice--1"></div>
                    <div class="hero__dice hero__dice--2"></div>
                    <div class="hero__dice hero__dice--3"></div>
                    <div class="hero__dice hero__dice--4"></div>
                    <div class="hero__square hero__square--1"></div>
                    <div class="hero__square hero__square--2"></div>
                    <div class="hero__square hero__square--3"></div>
                    <div class="hero__square hero__square--4"></div>
                    <div class="hero__square hero__square--5"></div>
                    <div class="hero__square hero__square--6"></div>
                </div>
                <div class="hero__content">
                    <h1 class="logo">Bigoti<span class="logo__accent">Tech</span></h1>
                    <p class="tagline">${this.t('home.heroTagline', 'Creamos experiencias digitales unicas')}</p>
                </div>
            </section>

            <main>
                <!-- Sobre Nosotros -->
                <section id="about" class="section-fw">
                    <div class="section-fw__inner">
                        <h2 class="section-fw__title">${this.t('home.aboutTitle', 'Sobre Nosotros')}</h2>
                        <p class="section-fw__subtitle">${this.t('home.aboutSubtitle', 'Un estudio independiente con pasion por crear')}</p>

                        <div class="about-modern">
                            <p class="about-modern__intro">
                                ${this.t('home.aboutIntro', 'Somos un estudio independiente de desarrollo de software enfocado en crear aplicaciones y juegos que combinan diseno intuitivo con tecnologia moderna. Nos apasiona transformar ideas en productos digitales que aporten valor real a los usuarios.')}
                            </p>

                            <div class="about-modern__grid">
                                <div class="about-modern__item">
                                    <div class="about-modern__icon">${this.icon('target', { size: 32 })}</div>
                                    <h3 class="about-modern__item-title">${this.t('home.mission', 'Mision')}</h3>
                                    <p class="about-modern__item-text">
                                        ${this.t('home.missionText', 'Desarrollar aplicaciones y juegos de calidad que sean accesibles, intuitivos y que mejoren la experiencia digital de nuestros usuarios.')}
                                    </p>
                                </div>
                                <div class="about-modern__item">
                                    <div class="about-modern__icon">${this.icon('eye', { size: 32 })}</div>
                                    <h3 class="about-modern__item-title">${this.t('home.vision', 'Vision')}</h3>
                                    <p class="about-modern__item-text">
                                        ${this.t('home.visionText', 'Convertirnos en un referente del desarrollo indie, creando productos que destaquen por su calidad y atencion al detalle.')}
                                    </p>
                                </div>
                                <div class="about-modern__item">
                                    <div class="about-modern__icon">${this.icon('gem', { size: 32 })}</div>
                                    <h3 class="about-modern__item-title">${this.t('home.values', 'Valores')}</h3>
                                    <p class="about-modern__item-text">
                                        ${this.t('home.valuesText', 'Calidad sobre cantidad. Privacidad del usuario. Diseno centrado en las personas. Mejora continua y aprendizaje constante.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Proyectos -->
                <section id="apps" class="section-fw section-fw--accent">
                    <div class="section-fw__inner">
                        <h2 class="section-fw__title">${this.t('home.projectsTitle', 'Nuestros Proyectos')}</h2>
                        <p class="section-fw__subtitle">${this.t('home.projectsSubtitle', 'Proyectos en los que estamos trabajando')}</p>

                        <div class="projects-filters">
                            <button class="projects-filter projects-filter--active" data-filter="all">
                                ${this.t('filter.all', 'Todos')}
                            </button>
                            <button class="projects-filter" data-filter="web">
                                ${this.t('filter.web', 'Web')}
                            </button>
                            <button class="projects-filter" data-filter="app">
                                ${this.t('filter.apps', 'Aplicaciones')}
                            </button>
                        </div>

                        <div class="apps-modern">
                            <a href="feature/applications/rokub-10000/" class="app-modern" data-type="app">
                                <img src="feature/applications/rokub-10000/assets/icon.webp" alt="Rokub 10000" class="app-modern__icon">
                                <div class="app-modern__content">
                                    <h3 class="app-modern__name">Rokub 10000</h3>
                                    <p class="app-modern__desc">${this.t('home.rokubDesc', 'El clasico juego de dados donde la estrategia y la suerte se combinan para alcanzar los 10.000 puntos.')}</p>
                                    <span class="app-modern__cta">${this.t('common.learnMore', 'Ver mas')}</span>
                                </div>
                            </a>
                            <a href="feature/applications/leporia/" class="app-modern" data-type="web">
                                <img src="feature/applications/leporia/assets/icon.png" alt="Leporia" class="app-modern__icon">
                                <div class="app-modern__content">
                                    <h3 class="app-modern__name">Leporia</h3>
                                    <p class="app-modern__desc">${this.t('home.leporiaDesc', 'Evalua tu cartera financiera segun tus metas personales de forma sencilla y visual.')}</p>
                                    <span class="app-modern__cta">${this.t('common.learnMore', 'Ver mas')}</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Equipo -->
                <section id="team" class="section-fw">
                    <div class="section-fw__inner">
                        <h2 class="section-fw__title">${this.t('home.teamTitle', 'Nuestro Equipo')}</h2>
                        <p class="section-fw__subtitle">${this.t('home.teamSubtitle', 'Las personas detras de BigotiTech')}</p>

                        <div class="team-modern">
                            <div class="team-modern__member">
                                <div class="team-modern__avatar">${this.icon('code', { size: 40 })}</div>
                                <h3 class="team-modern__name">${this.t('team.developer', 'Desarrollador')}</h3>
                                <p class="team-modern__role">${this.t('team.developerRole', 'Desarrollo & Diseno')}</p>
                                <p class="team-modern__bio">
                                    ${this.t('team.developerBio', 'Apasionado por crear aplicaciones utiles y bien disenadas. Enfocado en la experiencia del usuario y el codigo limpio.')}
                                </p>
                            </div>
                            <div class="team-modern__member">
                                <div class="team-modern__avatar">${this.icon('palette', { size: 40 })}</div>
                                <h3 class="team-modern__name">${this.t('team.designer', 'Disenador')}</h3>
                                <p class="team-modern__role">${this.t('team.designerRole', 'UI/UX & Arte')}</p>
                                <p class="team-modern__bio">
                                    ${this.t('team.designerBio', 'Especialista en crear interfaces intuitivas y visualmente atractivas. Cada pixel cuenta.')}
                                </p>
                            </div>
                            <div class="team-modern__member">
                                <div class="team-modern__avatar">${this.icon('gamepad', { size: 40 })}</div>
                                <h3 class="team-modern__name">${this.t('team.gameDesigner', 'Game Designer')}</h3>
                                <p class="team-modern__role">${this.t('team.gameDesignerRole', 'Mecanicas & Balance')}</p>
                                <p class="team-modern__bio">
                                    ${this.t('team.gameDesignerBio', 'Enfocado en crear experiencias de juego equilibradas y divertidas. La diversion es la prioridad.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    }
}

customElements.define('bigoti-home-content', BigotiHomeContent);
