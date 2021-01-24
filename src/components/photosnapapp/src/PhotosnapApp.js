import SiteHeader from '../../siteheader/src/SiteHeader.js';
import HomeSection from '../../homesection/src/HomeSection.js';
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
    }

    html() {
        this.shadowRoot.innerHTML += `
            <div id="appContainer">
                <site-header></site-header>
                <home-section></home-section>
                <site-footer></site-footer>
            <div>
        `;
    }

    sectionLoader() {}
}

if (!customElements.get('photosnapp')) {
    customElements.define('photosnap-app', PhotosnapApp)
}