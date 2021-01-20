export default class SiteHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        console.log('header loaded');
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <div id="headerContainer">
                Test
            </div>
        `;
    }
}

if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
}