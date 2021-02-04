export default class BetaCTABanner extends HTMLElement {
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
            <div id="container">
                <h2>WE'RE IN BETA. GET YOUR INVITE TODAY!</h2>
                <a id="cta" href="#000">
                    <p>GET AN INVITE</p>
                    <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
                </a>
            </div>
        `;
    }

    css() {
        this.defaultCSS();
        this.tabletLayoutCSS();
        this.mobileLayoutCSS();
    }

    defaultCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                :host {
                    background-image: url("../src/assets/shared/desktop/bg-beta.jpg");
                    background-repeat: no-repeat;
                    background-size: cover;
                    display: block;
                    max-width: 100%;
                    padding-bottom: 68px;
                    padding-left: 11.458%;
                    padding-right: 11.458%;
                    padding-top: 68px;
                    position: relative;
                }

                :host::before {
                    animation-name: load;
                    animation-duration: 0.7s;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                    background-image: var(--main-accent);
                    content: "";
                    height: 100%;
                    top: 0;
                    left: 0;
                    right: 0px;
                    position: absolute;
                    width: 6px;
                }

                @keyframes load {
                    0% {
                        transform: scaleY(0);
                    }
                    100% {
                        transform: scaleY(1);
                    }
                }

                #container {
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    position: relative;
                }

                #container > h2 {
                    color: var(--pure-white);
                    font-size: var(--font-size-5);
                    letter-spacing: var(--letter-spacing-2);
                    max-width: 400px;
                }

                #container > #cta {
                    align-items: center;
                    color: var(--pure-white);
                    cursor: pointer;
                    display: flex;
                    font-weight: bold;
                    justify-content: space-between;
                    margin-left: auto;
                    max-width: 168px;
                    max-height: 16px;
                    text-decoration: none;
                }

                #container > #cta > p {
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    margin-right: 16px;
                    white-space: nowrap;
                }

                #container > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-white);
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        background-image: url("../src/assets/shared/tablet/bg-beta.jpg");
                        padding-left: 2.708%;
                        padding-right: 2.708%;
                    }
                }
            </style>
        `;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        background-image: url("../src/assets/shared/mobile/bg-beta.jpg");
                        padding-bottom: 64px;
                        padding-top: 64px;
                        padding-left: 9%;
                        padding-right: 7%;
                    }

                    #container {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    #container > h2 {
                        font-size: var(--font-size-7);
                        letter-spacing: var(--letter-spacing-3);
                        line-height: var(--line-height-4);
                        margin-bottom: 24px;
                    }

                    :host::before {
                        animation-name: load;
                        animation-duration: 0.7s;
                        animation-fill-mode: forwards;
                        animation-iteration-count: 1;
                        background-image: var(--main-accent);
                        content: "";
                        height: 6px;
                        top: 0;
                        left: 33px;
                        right: 0px;
                        position: absolute;
                        width: 34.133%;
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
            </style>
        `;
    }
}

if (!customElements.get('beta-cta-banner')) {
    customElements.define('beta-cta-banner', BetaCTABanner)
}