export default class SiteHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.html();
        this.css();
    }

    html() {
        this.shadowRoot.innerHTML += `
            <div id="siteHeaderContainer">
                <img id="logo" src="../src/assets/shared/desktop/logo.svg" alt="company logo">
                <ul>
                    <li>STORIES</li>
                    <li>FEATURES</li>
                    <li>PRICING</li>
                </ul>
                <button>GET AN INVITE</button>
            </div>
        `;
    }

    css() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                :host {
                    display: block;
                    padding-top: 28px;
                    padding-bottom: 28px;
                    padding-left: 165px;
                    padding-right: 165px;
                }

                :host > #siteHeaderContainer {
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    OUTLINE: 1PX SOLID BLUE;
                }

                :host > #siteHeaderContainer > #logo {
                    height: 16px;
                    width: 170px;
                }

                :host > #siteHeaderContainer > ul {
                    display: flex;
                    flex-direction: row;
                    list-style: none;
                }

                :host > #siteHeaderContainer > ul > li {
                    cursor: pointer;
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    light-height: var(--line-height-1);
                }

                :host > #siteHeaderContainer > ul > li:not(:last-child) {
                    margin-right: 37px;
                }

                :host > #siteHeaderContainer > button {
                    color: var(--pure-white);
                    cursor: pointer;
                    background: none;
                    background-color: var(--pure-black);
                    border: none;
                    font-size: var(--font-size-1);
                    height: 40px;
                    letter-spacing: var(--letter-spacing-1);
                    width: 158px;
                }
            </style>
        `;
    }
}

if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
}