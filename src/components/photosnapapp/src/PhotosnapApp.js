import SiteHeader from '../../siteheader/src/SiteHeader.js';
import SiteFooter from '../../sitefooter/src/SiteFooter.js';

class PhotosnapApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.html();
        // this.css();
    }

    html() {
        this.shadowRoot.innerHTML += `
            <div id="appContainer">
                <site-header></site-header>
                <site-footer></site-footer>
            <div>
        `;
    }

    css() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }
            </style>
        `;
    }
}

if (!customElements.get('photosnapp')) {
    customElements.define('photosnap-app', PhotosnapApp)
}