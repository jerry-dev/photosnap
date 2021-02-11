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
        this.menuAnimationCSS();
    }

    html() {
        this.shadowRoot.innerHTML += `
            <div id="siteHeaderContainer">
                <img id="logo" src="../src/assets/shared/desktop/logo.svg" alt="company logo">
                <ul>
                    <li><a href="/stories">STORIES</a></li>
                    <li><a href="/features">FEATURES</a></li>
                    <li><a href="/pricing">PRICING</a></li>
                </ul>
                <button>GET AN INVITE</button>
                <ul id="menuIconContainer">
                    <img id="menuOpenIcon" src="../src/assets/shared/mobile/menu.svg" alt="menu open icon">
                    <img id="menuCloseIcon" src="../src/assets/shared/mobile/close.svg" alt="close icon">
                </ul>
            </div>
            <div id="dropDownOverlay">
                <div id="dropDownGroup">
                    <ul>
                        <li><a href="/stories">STORIES</a></li>
                        <li><a href="/features">FEATURES</a></li>
                        <li><a href="/pricing">PRICING</a></li>
                    </ul>
                    <button>GET AN INVITE</button>
                </div>
            </div>
        `;
    }

    defaultCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                a {
                    color: var(--pure-black);
                    text-decoration: none;
                }

                :host {
                    display: block;
                    max-width: 100%;
                    padding-top: 28px;
                    padding-bottom: 28px;
                    padding-left: 165px;
                    padding-right: 165px;
                }

                :host > #dropDownOverlay {
                    display: none;
                    position: absolute;
                    height: 100vh;
                    width: 100vw;
                    background-color: var(--opaque-pure-black-2);
                    margin-top: 28px;
                    left: 0;
                    right: 0;
                    z-index: 100;
                }

                :host > #dropDownOverlay > #dropDownGroup {
                    background-color: var(--pure-white);
                    display: flex;
                    left: 0;
                    right: 0;
                    top: -1px;
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

                :host > #siteHeaderContainer > ul, 
                :host > #dropDownOverlay > #dropDownGroup > ul {
                    display: flex;
                    flex-direction: row;
                    list-style: none;
                }

                :host > #siteHeaderContainer > ul > li,
                :host > #dropDownOverlay > #dropDownGroup > ul > li {
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
                :host > #dropDownOverlay > #dropDownGroup > ul > li:hover {
                    opacity: 0.3;
                }

                :host > #siteHeaderContainer > button,
                :host > #dropDownOverlay > #dropDownGroup > button {
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
                :host > #dropDownOverlay > #dropDownGroup > button:hover {
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
                    :host {
                        padding-left: 24px;
                        padding-right: 24px;
                    }

                    :host > #siteHeaderContainer {
                        align-items: center;
                        display: flex;
                        justify-content: space-between;
                    }

                    :host > #siteHeaderContainer > ul,
                    :host > #siteHeaderContainer > button {
                        display: none;
                    }

                    :host > #siteHeaderContainer > ul,
                    :host > #siteHeaderContainer > button {
                        display: none;
                    }

                    :host > #dropDownOverlay > #dropDownGroup {
                        align-items: center;
                        flex-direction: column;
                    }

                    :host > #dropDownOverlay > #dropDownGroup > ul {
                        align-items: center;
                        border-bottom: 1px solid var(--opaque-pure-black-1);
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 20px;
                        width: 100%;
                    }

                    :host > #dropDownOverlay > #dropDownGroup > ul > li {
                        font-size: var(--font-size-2);
                        margin-bottom: 20px;
                    }

                    :host > #dropDownOverlay > #dropDownGroup > button {
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
                }
            </style>`;
    }

    menuAnimationCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                :host > #dropDownOverlay {
                    animation-fill-mode: forwards;
                    animation-duration: 0.1s;
                    animation-iteration-count: 1;
                }

                @keyframes openOverlay {
                    0% {
                        transform: scaleX(0);
                        transform: scaleY(0);
                    }
                    
                    100% {
                        transform: scaleX(1);
                        transform: scaleY(1);
                    }
                }

                @keyframes closeOverlay {
                    0% {
                        transform: scaleX(1);
                        transform: scaleY(1);
                    }
                    
                    100% {
                        transform: scaleX(0);
                        transform: scaleY(0);
                    }
                }

                :host > #dropDownOverlay > #dropDownGroup {
                    animation-fill-mode: forwards;
                    animation-duration: 0.5s;
                    animation-iteration-count: 1;
                }

                @keyframes openMenu {
                    0%, 50% {
                        opacity: 0;
                        transform: translate3d(0, -400px, 0);
                    }
                    
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
            </stlye>`
        ;
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

            window.addEventListener('scroll', () => {
                if (this.isMobileMenuOpen()) {
                    this.closeMobileMenu();
                }
            });

            window.addEventListener('resize', () => {
                if (this.isMobileMenuOpen() && window.innerWidth > 700) {
                    this.closeMobileMenu();
                }
            });
        });
    }

    openMobileMenu() {
        this.shadowRoot.querySelector('#dropDownOverlay').style.animationName = 'openOverlay';
        this.shadowRoot.querySelector('#dropDownOverlay > #dropDownGroup').style.animationName = 'openMenu';
        this.shadowRoot.querySelector('#dropDownOverlay').style.display = 'block';
        this.shadowRoot.querySelector('#menuIconContainer > #menuOpenIcon').style.display = 'none';
        this.shadowRoot.querySelector('#menuIconContainer > #menuCloseIcon').style.display = 'block';
    }

    closeMobileMenu() {
        this.shadowRoot.querySelector('#dropDownOverlay').style.animationName = 'closeOverlay';
        this.shadowRoot.querySelector('#dropDownOverlay > #dropDownGroup').style.animationName = '';
        setTimeout(() => {
            this.shadowRoot.querySelector('#dropDownOverlay').style.display = 'none';
            this.shadowRoot.querySelector('#menuIconContainer > #menuOpenIcon').style.display = 'block';
            this.shadowRoot.querySelector('#menuIconContainer > #menuCloseIcon').style.display = 'none';
        }, 200);
    }


    isMobileMenuOpen() {
        const result = this.shadowRoot.querySelector('#dropDownOverlay').style.display;
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
