/**
 * Footer Component - Reutilizable en todas las páginas
 */
class BigotiFooter extends HTMLElement {
    connectedCallback() {
        // Detectar la profundidad del path para las rutas relativas
        const depth = this.getAttribute('depth') || '0';
        const basePath = '../'.repeat(parseInt(depth));

        // Añadir id para navegación por ancla
        this.id = 'contacto';

        this.innerHTML = `
            <div class="footer__container">
                <div class="footer__main">
                    <div class="footer__brand">
                        <div class="footer__logo">
                            <img src="${basePath}assets/img/brand/logo-bigotitech.png" alt="BigotiTech" class="footer__logo-img">
                            <span class="footer__logo-text">Bigoti<span>Tech</span></span>
                        </div>
                        <p class="footer__tagline">Desarrollamos aplicaciones móviles y webs con pasión. Creamos experiencias únicas y memorables.</p>
                    </div>

                    <div class="footer__contact">
                        <div class="footer__contact-item">
                            <span class="footer__contact-icon">✉</span>
                            <a href="mailto:bigotitech@proton.me">bigotitech@proton.me</a>
                        </div>
                    </div>
                </div>

                <div class="footer__bottom">
                    <p class="footer__copyright">&copy; ${new Date().getFullYear()} BigotiTech. Todos los derechos reservados.</p>
                </div>
            </div>
        `;
    }
}

customElements.define('bigoti-footer', BigotiFooter);
