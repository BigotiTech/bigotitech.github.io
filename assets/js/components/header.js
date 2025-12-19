/**
 * Header Component - Reutilizable en todas las páginas
 */
class BigotiHeader extends HTMLElement {
    connectedCallback() {
        const depth = this.getAttribute('depth') || '0';
        const basePath = '../'.repeat(parseInt(depth));
        const isHome = this.hasAttribute('home');

        this.innerHTML = `
            <nav class="header__nav">
                <a href="${basePath}${isHome ? '#' : ''}" class="header__logo">
                    <img src="${basePath}assets/img/brand/logo-bigotitech.png" alt="BigotiTech" class="header__logo-img">
                    <span class="header__logo-text">Bigoti<span>Tech</span></span>
                </a>
                <ul class="header__menu">
                    <li><a href="${basePath}#apps" class="header__link">Apps</a></li>
                    <li><a href="${basePath}#contacto" class="header__link">Contacto</a></li>
                </ul>
            </nav>
        `;
    }
}

customElements.define('bigoti-header', BigotiHeader);
