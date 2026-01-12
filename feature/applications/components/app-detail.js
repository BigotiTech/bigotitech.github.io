/**
 * App Detail Component - Renderiza pagina de app desde JSON
 */
class BigotiAppDetail extends HTMLElement {
    connectedCallback() {
        const depth = this.getAttribute('depth') || '0';
        const appId = this.getAttribute('app-id');

        this.depth = parseInt(depth);
        this.appId = appId;
        this.basePath = '../'.repeat(this.depth);
        this.appData = null;

        this.initIcons();
        this.render(); // Render placeholder
        this.loadData();
    }

    initIcons() {
        if (typeof icons !== 'undefined') {
            icons.init(this.basePath);
        }
    }

    async loadData() {
        try {
            // Wait for i18n to be ready
            if (typeof i18n !== 'undefined') {
                await i18n.init();
                i18n.onLanguageChange(() => this.loadData());
            }

            const lang = typeof i18n !== 'undefined' ? i18n.getLang() : 'es';

            // Load app data using dataLoader or fetch directly
            if (typeof dataLoader !== 'undefined') {
                this.appData = await dataLoader.loadAppData(this.appId, lang);
            } else {
                const response = await fetch(`${this.basePath}feature/applications/${this.appId}/data/${lang}.json`);
                this.appData = await response.json();
            }

            this.render();
            await this.loadIcons();
            this.initCarousel();
        } catch (error) {
            console.error('Error loading app data:', error);
            this.renderError();
        }
    }

    async loadIcons() {
        if (typeof icons !== 'undefined') {
            await icons.render(this);
        }
    }

    initCarousel() {
        const carousel = this.querySelector('.app-detail-carousel');
        const track = this.querySelector('.app-detail-carousel__track');
        const slides = Array.from(this.querySelectorAll('.app-detail-carousel__slide'));
        const dots = this.querySelectorAll('.app-detail-carousel__dot');
        const prevBtn = this.querySelector('.app-detail-carousel__nav--prev');
        const nextBtn = this.querySelector('.app-detail-carousel__nav--next');

        if (!track || slides.length <= 1) return;

        const total = slides.length;
        let currentIndex = 0;

        // Helper to get circular index
        const getCircularIndex = (index) => ((index % total) + total) % total;

        const updateCarousel = () => {
            slides.forEach((slide, i) => {
                slide.classList.remove(
                    'app-detail-carousel__slide--active',
                    'app-detail-carousel__slide--prev',
                    'app-detail-carousel__slide--next',
                    'app-detail-carousel__slide--hidden'
                );

                const prevIndex = getCircularIndex(currentIndex - 1);
                const nextIndex = getCircularIndex(currentIndex + 1);

                if (i === currentIndex) {
                    slide.classList.add('app-detail-carousel__slide--active');
                    slide.style.transform = 'translateX(0) scale(1)';
                    slide.style.order = '2';
                } else if (i === prevIndex) {
                    slide.classList.add('app-detail-carousel__slide--prev');
                    slide.style.transform = `translateX(0) scale(0.9)`;
                    slide.style.order = '1';
                } else if (i === nextIndex) {
                    slide.classList.add('app-detail-carousel__slide--next');
                    slide.style.transform = `translateX(0) scale(0.9)`;
                    slide.style.order = '3';
                } else {
                    slide.classList.add('app-detail-carousel__slide--hidden');
                    slide.style.order = '4';
                }
            });

            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('app-detail-carousel__dot--active', i === currentIndex);
            });
        };

        const goToSlide = (index) => {
            currentIndex = getCircularIndex(index);
            updateCarousel();
        };

        const next = () => goToSlide(currentIndex + 1);
        const prev = () => goToSlide(currentIndex - 1);

        // Navigation buttons
        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', next);

        // Dots navigation
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.index));
            });
        });

        // Touch/swipe support
        let startX = 0;
        let isDragging = false;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) next();
                else prev();
            }
            isDragging = false;
        }, { passive: true });

        // Mouse drag support
        let mouseStartX = 0;
        let isMouseDragging = false;

        carousel.addEventListener('mousedown', (e) => {
            mouseStartX = e.clientX;
            isMouseDragging = true;
            carousel.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', (e) => {
            if (!isMouseDragging) return;
            const diff = mouseStartX - e.clientX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) next();
                else prev();
            }
            isMouseDragging = false;
            carousel.style.cursor = 'grab';
        });

        carousel.addEventListener('mouseleave', () => {
            isMouseDragging = false;
            carousel.style.cursor = 'grab';
        });

        // Keyboard navigation
        this.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });

        // Set initial cursor
        carousel.style.cursor = 'grab';

        // Initialize
        updateCarousel();
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

    getPlatformIcon(platformId) {
        const mapping = {
            'web': 'globe',
            'android': 'smartphone',
            'ios': 'apple',
            'windows': 'desktop',
            'mac': 'monitor',
            'linux': 'linux'
        };
        return this.icon(mapping[platformId] || 'package', { size: 16 });
    }

    getFeatureIcon(iconName) {
        const mapping = {
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
            'android': 'smartphone',
            'ios': 'apple'
        };
        return this.icon(mapping[iconName] || iconName, { size: 24 });
    }

    render() {
        if (!this.appData) {
            this.innerHTML = `
                <div class="app-detail-loading">
                    <div class="app-detail-loading__spinner"></div>
                </div>
            `;
            return;
        }

        const data = this.appData;
        const screenshotsLabel = this.t('common.screenshots', 'Capturas de pantalla');
        const featuresLabel = this.t('common.features', 'Caracteristicas');

        // Build platforms display
        const platformsHtml = data.platforms.map(p => `
            <span class="app-detail-header__platform">
                ${this.getPlatformIcon(p.id)} ${p.name}
            </span>
        `).join('');

        // Build features grid
        const featuresHtml = data.features.map(f => `
            <li class="app-detail-features__item">
                <div class="app-detail-features__icon">${this.getFeatureIcon(f.icon)}</div>
                <p class="app-detail-features__text">${f.text}</p>
            </li>
        `).join('');

        // Build screenshots carousel
        const hasScreenshots = data.screenshots && data.screenshots.length > 0;
        const screenshotsHtml = hasScreenshots
            ? data.screenshots.map((s, i) => `
                <div class="app-detail-carousel__slide" data-index="${i}">
                    <img src="${this.basePath}${s.src}" alt="${s.alt}" loading="lazy">
                </div>
            `).join('')
            : '';

        const dotsHtml = hasScreenshots && data.screenshots.length > 1
            ? data.screenshots.map((_, i) => `
                <button class="app-detail-carousel__dot ${i === 0 ? 'app-detail-carousel__dot--active' : ''}"
                        data-index="${i}" aria-label="Ir a imagen ${i + 1}"></button>
            `).join('')
            : '';

        // Build CTA
        const primaryBtn = data.cta.primary;
        const secondaryBtn = data.cta.secondary;
        const ctaTitle = this.t('app.tryApp', 'Prueba {appName}').replace('{appName}', data.name);

        this.innerHTML = `
            <!-- App Header -->
            <section class="app-detail-header">
                <div class="app-detail-header__inner">
                    <img src="${this.basePath}feature/applications/${this.appId}/${data.icon}"
                         alt="${data.name}"
                         class="app-detail-header__icon">
                    <div class="app-detail-header__info">
                        <h1 class="app-detail-header__name">${data.name}</h1>
                        <p class="app-detail-header__tagline">${data.tagline}</p>
                        <div class="app-detail-header__platforms">
                            ${platformsHtml}
                        </div>
                    </div>
                </div>
            </section>

            <!-- Description -->
            <section class="app-detail-description">
                <div class="app-detail-description__inner">
                    <p class="app-detail-description__text">${data.description}</p>
                </div>
            </section>

            <!-- Features -->
            <section class="app-detail-features">
                <div class="app-detail-features__inner">
                    <h2 class="app-detail-features__title">${featuresLabel}</h2>
                    <ul class="app-detail-features__grid">
                        ${featuresHtml}
                    </ul>
                </div>
            </section>

            ${hasScreenshots ? `
            <!-- Screenshots Carousel -->
            <section class="app-detail-screenshots">
                <div class="app-detail-screenshots__inner">
                    <h2 class="app-detail-screenshots__title">${screenshotsLabel}</h2>
                    <div class="app-detail-carousel">
                        ${data.screenshots.length > 1 ? `
                        <button class="app-detail-carousel__nav app-detail-carousel__nav--prev" aria-label="Anterior">
                            ${this.icon('arrow-left', { size: 24 })}
                        </button>
                        ` : ''}
                        <div class="app-detail-carousel__track">
                            ${screenshotsHtml}
                        </div>
                        ${data.screenshots.length > 1 ? `
                        <button class="app-detail-carousel__nav app-detail-carousel__nav--next" aria-label="Siguiente">
                            ${this.icon('arrow-right', { size: 24 })}
                        </button>
                        ` : ''}
                    </div>
                    ${dotsHtml ? `<div class="app-detail-carousel__dots">${dotsHtml}</div>` : ''}
                </div>
            </section>
            ` : ''}

            <!-- CTA -->
            <section class="app-detail-cta">
                <div class="app-detail-cta__inner">
                    <h2 class="app-detail-cta__title">${ctaTitle}</h2>
                    <div class="app-detail-cta__buttons">
                        <a href="${primaryBtn.url || '#'}"
                           class="btn btn--filled ${primaryBtn.disabled ? 'btn--disabled' : ''}"
                           ${primaryBtn.disabled ? 'aria-disabled="true"' : ''}>
                            ${primaryBtn.disabled ? primaryBtn.disabledText : primaryBtn.text}
                        </a>
                        <a href="${secondaryBtn.url}" class="btn btn--outline">
                            ${secondaryBtn.text}
                        </a>
                    </div>
                </div>
            </section>
        `;
    }

    renderError() {
        const isFileProtocol = window.location.protocol === 'file:';
        const errorMessage = isFileProtocol
            ? 'Error al cargar los datos. Por favor, usa un servidor web local (ej: Live Server en VS Code).'
            : 'Error al cargar los datos de la aplicacion';

        this.innerHTML = `
            <div class="app-detail-error">
                <p>${errorMessage}</p>
                ${isFileProtocol ? '<p style="font-size: 0.9em; opacity: 0.8;">El protocolo file:// no permite cargar archivos JSON.</p>' : ''}
            </div>
        `;
    }
}

customElements.define('bigoti-app-detail', BigotiAppDetail);
