export default class HeroSection extends HTMLElement {
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
                        <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
                    </a>
                </span>
                <span class="imageBox"></span>
            </div>

            <div id="row-2" class="row">
                <span class="imageBox"></span>
                <span class="descriptionBox">
                    <h2>BEAUTIFUL STORIES EVERY TIME</h2>
                    <p>
                        We provide design templates to ensure your stories
                        look terrific. Easily add photos, text, embed maps
                        and media from other networks. Then share your
                        story with everyone.
                    </p>
                    <a id="cta" href="#000">
                        <p>VIEW THE STORIES</p>
                        <img class="arrowIcon" src="../src/assets/shared/desktop/arrow.svg">
                    </a>
                </span>
            </div>

            <div id="row-3" class="row">
                <span class="descriptionBox">
                    <h2>DESIGNED FOR EVERYONE</h2>
                    <p>
                        Photosnap can help you create stories that resonate with your audience.  Our tool is designed for
                        photographers of all levels, brands, businesses you name it. 
                    </p>
                    <a id="cta" href="#000">
                        <p>VIEW THE STORIES</p>
                        <img class="arrowIcon" src="../src/assets/shared/desktop/arrow.svg">
                    </a>
                </span>
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

                .row > .descriptionBox > h2 {
                    font-size: var(--font-size-5);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-2);
                    margin-bottom: 21px;
                }

                .row > .descriptionBox > p {
                    font-size: var(--font-size-2);
                    line-height: 25px;
                    opacity: 0.6;
                    margin-bottom: 48px;
                }

                #cta {
                    align-items: center;
                    cursor: pointer;
                    display: flex;
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


                #row-1 > .descriptionBox {
                    background-color: var(--pure-black);
                    color: var(--light-grey);
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-top: 173px;
                    padding-bottom: 173px;
                    max-width: 387px;
                    max-height: 304px;
                }

                #row-1 > .descriptionBox > #cta {
                    color: var(--pure-white);
                    font-weight: bold;
                }

                #row-1 > .descriptionBox > #cta > p:hover {
                    border-bottom: 1px solid var(--light-grey);
                }

                #row-1 > .imageBox {
                    background-image: url("../src/assets/home/desktop/create-and-share.jpg");
                    background-position: center;
                    height: 650px;
                    padding-right: 57.64%;
                }

                #row-2 > .imageBox {
                    background-image: url("../src/assets/home/desktop/beautiful-stories.jpg");
                    background-position: center;
                    height: 600px;
                    padding-right: 57.64%;
                }

                #row-2 > .descriptionBox {
                    padding-top: 136px;
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-bottom: 135px;
                    max-width: 387px;
                    max-height: 329px;                   
                }

                #row-2 > .descriptionBox > #cta {
                    color: var(--pure-black);
                    font-weight: bold;
                }

                #row-2 > .descriptionBox > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .descriptionBox {
                    padding-top: 160px;
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-bottom: 159px;
                    max-width: 387px;
                    max-height: 281px;                   
                }

                #row-3 > .descriptionBox > #cta {
                    color: var(--pure-black);
                    font-weight: bold;
                }

                #row-3 > .descriptionBox > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .imageBox {
                    background-image: url("../src/assets/home/desktop/designed-for-everyone.jpg");
                    background-position: center;
                    height: 600px;
                    padding-right: 57.64%;
                }
            </style>
        `;
    }
}

if (!customElements.get('hero-section')) {
    customElements.define('hero-section', HeroSection)
}