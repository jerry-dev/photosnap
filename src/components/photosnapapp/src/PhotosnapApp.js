import SiteHeader from '../../siteheader/src/SiteHeader.js';

class PhotosnapApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        console.log('app loaded');
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <site-header></site-header>
        `;
    }
}

if (!customElements.get('photosnapp')) {
    customElements.define('photosnap-app', PhotosnapApp)
}