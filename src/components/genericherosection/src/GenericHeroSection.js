export default class GenericHeroSection extends HTMLElement {
    static get observedAttributes() {
        return  ['desktopImage, tabletImage, mobileImage, title, paragraph'];
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    attributeChangeCallback(attrName, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[attrName] = this.getAttribute(attrName);
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.html();
        this.css();
    }

    css()  {
        this.defaultCSS();
        this.tabletLayoutCSS();
        this.mobileLayoutCSS();
    }

    html() {
        this.shadowRoot.innerHTML +=  `
            <div id="hero" class="row">
                <span class="descriptionBox">
                    <div class="descriptionContainer">
                        <h2>${this.getAttribute('title')}</h2>
                        <p>${this.getAttribute('paragraph')}</p>
                    </div>
                </span>
                <span class="imageBox"></span>
            </div>
        `;
    }

    defaultCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0, padding: 0; }

                #hero {
                    display: flex;
                    flex-direction: row;
                    height: 490px;
                    max-width: 100%;
                }

                #hero > .descriptionBox {
                    background-color: var(--pure-black);
                    color: var(--opaque-pure-white-2);
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-top: 173px;
                    padding-bottom: 173px;
                    max-height: 100%;
                }

                #hero > .descriptionBox > .descriptionContainer {
                    margin-top: -33px;
                    max-width: 387px;
                }

                #hero > .descriptionBox > .descriptionContainer > h2 {
                    color: var(--pure-white);
                    font-size: var(--font-size-5);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-2);
                    line-height: var(--line-height-3);
                    margin-bottom: 21px;
                }

                #hero > .descriptionBox > .descriptionContainer::after {
                    animation-name: load;
                    animation-duration: 0.7s;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                    content: "";
                    background-image: var(--main-accent);
                    display: block;
                    height: 144px;
                    left: -112px;
                    bottom: 160px;
                    position: relative;
                    width: 6px;
                }

                @keyframes load {
                    0% {
                        transform: scaleY(3);
                    }
                    100% {
                        transform: scaleY(1);
                    }
                }

                #hero > .imageBox {
                    background-image: url("${this.getAttribute('desktopImage')}");
                    background-position: center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    height: 100%;
                    width: 830px;     
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #hero > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        max-width: 495px;
                    }

                    #hero > .descriptionBox > .descriptionContainer::after {
                        left: -54px;
                    }

                    #hero > .imageBox {
                        background-image: url("${this.getAttribute('tabletImage')}");
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {

                    #hero {
                        flex-direction: column;
                        height: 594px;
                        width: 375px;
                    }

                    #hero > .imageBox {
                        background-image: url("${this.getAttribute('mobileImage')}");
                        background-repeat: no-repeat;
                        background-size: cover;
                        max-width: 100%;
                        order: 1;
                    }

                    #hero > .descriptionBox {
                        Xheight: 419px;
                        padding-left: 33px;
                        padding-right: 24px;
                        padding-top: 72px;
                        padding-bottom: 72px;
                        max-width: 100%;
                        order: 2;
                    }

                    #hero > .descriptionBox > .descriptionContainer {
                        width: 318px;
                    }

                    #hero > .descriptionBox > .descriptionContainer > h2 {
                        font-size: var(--font-size-7);
                        letter-spacing: var(--letter-spacing-3);
                        line-height: var(--line-height-4);
                        margin-bottom: 16px;
                    }

                    #hero > .descriptionBox > .descriptionContainer > p {
                        margin-bottom: 23px;
                    }

                    #hero > .descriptionBox > .descriptionContainer:hover::after {
                        display: none;
                    }

                    #hero > .descriptionBox > .descriptionContainer::after {
                        animation-name: load;
                        animation-duration: 0.7s;
                        animation-fill-mode: forwards;
                        animation-iteration-count: 1;
                        content: "";
                        background-image: var(--main-accent);
                        display: block;
                        height: 6px;
                        left: 0px;
                        bottom: 245px;
                        position: relative;
                        width: 128px;
                    }
    
                    @keyframes load {
                        0% {
                            transform: scaleX(0);
                        }
                        100% {
                            transform: scaleX(1);
                        }
                    }
                }
            </style>`;
    }
}

if (!customElements.get('generic-hero-section')) {
    customElements.define('generic-hero-section', GenericHeroSection)
}