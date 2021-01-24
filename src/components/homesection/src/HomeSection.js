export default class HomeSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
    }

    render()  {
        this.html();
        this.css();
    }

    html() {
        this.shadowRoot.innerHTML += `
            <div id="row-1" class="row">
                <span class="descriptionBox">
                    <h2>CREATE AND SHARE YOUR PHOTO STORIES.</h2>
                    <p>
                        Photosnap is a platform for photographers and visual
                        storytellsers. We make it easy to share photos, tell
                        stories and connect with others.
                    </p>
                    <a id="cta" href="#000">
                    <p>GET AN INVITE</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="14" viewBox="0 0 42 14" fill="none">
                    <path d="M0 7H41.864" stroke="white"/>
                    <path d="M35.4282 1L41.4282 7L35.4282 13" stroke="white"/>
                    </svg>                    
                </a>
                </span>
                <span class="imageBox"></span>
            </div>
            <div id="row-2" class="row">
                <span class="imageBox"></span>
                <span class="descriptionBox"></span>
            </div>
            <div id="row-3" class="row">
                <span class="descriptionBox"></span>
                <span class="imageBox"></span>
            </div>
        `;
    }

    css() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0, padding: 0; }

                .row {
                    display: flex;
                    flex-direction: row;
                }

                #row-1 > .descriptionBox {
                    background-color: var(--pure-black);
                    color: var(--pure-white);
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-top: 173px;
                    padding-bottom: 173px;
                    max-width: 387px;
                    max-height: 304px;
                }

                #row-1 > .descriptionBox > h2 {
                    font-size: var(--font-size-5);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-2);
                }

                #row-1 > .descriptionBox > p {
                    font-size: var(--font-size-2);
                    line-height: 25px;
                    opacity: 0.6;
                }

                #row-1 > .imageBox {
                    background-image: url("../src/assets/home/desktop/create-and-share.jpg");
                    background-position: center;
                    height: 650px;
                    padding-right: 57.64%;
                }



                #cta {
                    align-items: center;
                    color: var(--pure-white);
                    cursor: pointer;
                    display: flex;
                    margin-left: auto;
                    max-width: 168px;
                    max-height: 16px;
                    text-decoration: none;
                }

                #cta > p {
                    font-size: var(--font-size-1);
                    letter-spacing: var(--letter-spacing-1);
                    margin-right: 16px;
                    white-space: nowrap;
                }

                #cta > p:hover {
                    border-bottom: 1px solid var(--light-grey);
                }
            </style>
        `;
    }
}

if (!customElements.get('home-section')) {
    customElements.define('home-section', HomeSection)
}