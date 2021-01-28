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
        this.scripts();
    }

    css() {
        this.defaultCSS();
        this.tabletLayoutCSS();
        this.mobileLayoutCSS();
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
                <ul id="menuIconContainer">
                    <img id="menuOpenIcon" src="../src/assets/shared/mobile/menu.svg" alt="menu open icon">
                    <img id="menuCloseIcon" src="../src/assets/shared/mobile/close.svg" alt="close icon">
                </ul>
            </div>
            <div id="dropDownGroup">
                <ul>
                    <li>STORIES</li>
                    <li>FEATURES</li>
                    <li>PRICING</li>
                </ul>
                <button>GET AN INVITE</button>
            </div>
        `;
    }

    defaultCSS() {
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

                :host > #dropDownGroup {
                    background-color: var(--pure-white);
                    display: none;
                    left: 0;
                    right: 0;
                    margin-top: 28px;
                    padding-bottom: 32px;
                    padding-left: 33px;
                    padding-right: 32px;
                    padding-top: 32px;
                    position: absolute;
                }

                :host > #siteHeaderContainer {
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }

                :host > #siteHeaderContainer > #logo {
                    height: 16px;
                    width: 170px;
                }

                :host > #siteHeaderContainer > ul, 
                :host > #dropDownGroup > ul {
                    display: flex;
                    flex-direction: row;
                    list-style: none;
                }

                :host > #siteHeaderContainer > ul > li,
                :host > #dropDownGroup > ul > li {
                    cursor: pointer;
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    light-height: var(--line-height-1);
                }

                :host > #siteHeaderContainer > ul > li:not(:last-child) {
                    margin-right: 37px;
                }

                :host > #siteHeaderContainer > ul > li:hover,
                :host > #dropDownGroup > ul > li:hover {
                    opacity: 0.3;
                }

                :host > #siteHeaderContainer > button,
                :host > #dropDownGroup > button {
                    color: var(--pure-white);
                    cursor: pointer;
                    background: none;
                    background-color: var(--pure-black);
                    border: none;
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    height: 40px;
                    letter-spacing: var(--letter-spacing-1);
                    width: 158px;
                }

                :host > #siteHeaderContainer > button:hover,
                :host > #dropDownGroup > button:hover {
                    color: rgba(0, 0, 0, 1);
                    background-color: var(--light-grey);
                }

                :host > #siteHeaderContainer > #menuIconContainer {
                    display: none;
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 968px) {
                    :host {
                        display: block;
                        padding-left: 39px;
                        padding-right: 40px;
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 700px) {
                    :host > #siteHeaderContainer > ul,
                    :host > #siteHeaderContainer > button {
                        display: none;
                    }

                    :host > #siteHeaderContainer > ul,
                    :host > #siteHeaderContainer > button {
                        display: none;
                    }

                    :host > #dropDownGroup {
                        align-items: center;
                        flex-direction: column;
                    }

                    :host > #dropDownGroup > ul {
                        align-items: center;
                        border-bottom: 1px solid var(--opaque-pure-black);
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 20px;
                        width: 100%;
                    }

                    :host > #dropDownGroup > ul > li {
                        font-size: var(--font-size-2);
                        margin-bottom: 20px;
                    }

                    :host > #dropDownGroup > button {
                        font-size: var(--font-size-2);
                        height: 48px;
                        width: 100%;
                    }

                    :host > #siteHeaderContainer > #menuIconContainer {
                        display: block;
                    }

                    :host > #siteHeaderContainer > #menuIconContainer > #menuCloseIcon {
                        display: none;
                    }

                    :host > #dropDownGroup {
                        animation-fill-mode: forwards;
                        animation-duration: 0.2s;
                        animation-iteration-count: 1;
                    }

                    @keyframes openMenu {
                        0% {
                            transform: translate3d(0, -100px, 0)
                        }
                        
                        100% {
                            transform: translate3d(0, 0, 0)
                        }
                    }

                    @keyframes closeMenu {
                        0% {
                            transform: translate3d(0, 0, 0)
                        }
                        
                        100% {
                            transform: translate3d(0, -300px, 0)
                        }
                    }
                }
            </style>`;
    }

    scripts() {
        this.mobileMenuToggle();
    }

    mobileMenuToggle() {
        this.shadowRoot.addEventListener('click', (event) => {
            const { id } = event.target;
            switch (id) {
                case 'dropDownGroup': this.toggleMobileMenu();
                break;
                case 'menuOpenIcon': this.openMobileMenu();
                break;
                case 'menuCloseIcon': this.closeMobileMenu();
                break;
            }

            window.addEventListener('keydown', (event) => {
                if (this.isMobileMenuOpen() && event.key === 'Escape') {
                    this.closeMobileMenu();
                }
            });

            window.addEventListener('resize', () => {
                if (this.isMobileMenuOpen() && window.innerWidth > 700) {
                    this.closeMobileMenuQuickly();
                }
            });
        });
    }

    openMobileMenu() {
        this.shadowRoot.querySelector('#dropDownGroup').style.animationName = 'openMenu';
        this.shadowRoot.querySelector('#dropDownGroup').style.display = 'flex';
        this.shadowRoot.querySelector('#menuIconContainer > #menuOpenIcon').style.display = 'none';
        this.shadowRoot.querySelector('#menuIconContainer > #menuCloseIcon').style.display = 'block';
    }

    closeMobileMenu() {
        this.shadowRoot.querySelector('#dropDownGroup').style.animationName = 'closeMenu';
        setTimeout(() => {
            this.shadowRoot.querySelector('#dropDownGroup').style.display = 'none';
            this.shadowRoot.querySelector('#menuIconContainer > #menuOpenIcon').style.display = 'block';
            this.shadowRoot.querySelector('#menuIconContainer > #menuCloseIcon').style.display = 'none';
        }, 200);
    }

    closeMobileMenuQuickly() {
        this.shadowRoot.querySelector('#dropDownGroup').style.display = 'none';
        this.shadowRoot.querySelector('#menuIconContainer > #menuOpenIcon').style.display = 'block';
        this.shadowRoot.querySelector('#menuIconContainer > #menuCloseIcon').style.display = 'none';
    }

    isMobileMenuOpen() {
        const result = this.shadowRoot.querySelector('#dropDownGroup').style.display;
        return (result !== "none") ? true : false;
    }

    toggleMobileMenu() {
        if (!this.isMobileMenuOpen()) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }
}

if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
}
