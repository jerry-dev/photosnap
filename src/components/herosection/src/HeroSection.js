export default class HeroSection extends HTMLElement {
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

    css()  {
        this.defaultCSS();
        this.tabletLayoutCSS();
        this.mobileLayoutCSS();
    }

    html() {
        this.shadowRoot.innerHTML += `
            <div id="row-1" class="row">
                <span class="descriptionBox">
                    <div class="descriptionContainer">
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
                    </div>
                </span>
                <span class="imageBox"></span>
            </div>

            <div id="row-2" class="row">
                <span class="imageBox"></span>
                <span class="descriptionBox">
                    <div class="descriptionContainer">
                        <h2>BEAUTIFUL STORIES<br> EVERY TIME</h2>
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
                    </div>
                </span>
            </div>

            <div id="row-3" class="row">
                <span class="descriptionBox">
                    <div class="descriptionContainer">
                        <h2>DESIGNED FOR EVERYONE</h2>
                        <p>
                            Photosnap can help you create stories that resonate with your audience.  Our tool is designed for
                            photographers of all levels, brands, businesses you name it. 
                        </p>
                        <a id="cta" href="#000">
                            <p>VIEW THE STORIES</p>
                            <img class="arrowIcon" src="../src/assets/shared/desktop/arrow.svg">
                        </a>
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

                .row {
                    display: flex;
                    flex-direction: row;
                }

                .row > .descriptionBox > .descriptionContainer {
                    margin-top: -33px;
                }

                .row > .descriptionBox > .descriptionContainer > h2 {
                    font-size: var(--font-size-5);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-2);
                    line-height: var(--line-height-3);
                    margin-bottom: 21px;
                }

                .row > .descriptionBox > .descriptionContainer >  p {
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);
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
                    font-weight: bold;
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
                    max-width: 610px;
                    max-height: 100%;
                }

                #row-1 {
                    height: 650px;
                    max-width: 100%;
                }

                #row-2,
                #row-3 {
                    height: 600px;
                    max-width: 100%;
                }

                #row-1 > .descriptionBox > .descriptionContainer,
                #row-2 > .descriptionBox > .descriptionContainer,
                #row-3 > .descriptionBox > .descriptionContainer {
                    width: 387px;
                }

                #row-1 > .descriptionBox > .descriptionContainer > #cta {
                    color: var(--pure-white);
                    font-weight: bold;
                }

                #row-1 > .descriptionBox > .descriptionContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--light-grey);
                }

                #row-1 > .imageBox {
                    background-image: url("../src/assets/home/desktop/create-and-share.jpg");
                    background-position: center;
                    height: 100%;
                    width: 830px;     
                }

                #row-2 > .imageBox {
                    background-image: url("../src/assets/home/desktop/beautiful-stories.jpg");
                    background-position: center;
                    height: 100%;
                    width: 830px;                    
                }

                #row-2 > .descriptionBox {
                    max-height: 100%;
                    max-width: 610px;
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-top: 173px;
                    padding-bottom: 173px;
                }

                #row-2 > .descriptionBox > .descriptionContainer > #cta {
                    color: var(--pure-black);
                    font-weight: bold;
                }

                #row-2 > .descriptionBox > .descriptionContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .descriptionBox {
                    max-height: 100%;
                    padding-top: 160px;
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-bottom: 159px; 
                    max-width: 610px;                  
                }

                #row-3 > .descriptionBox > .descriptionContainer > #cta {
                    color: var(--pure-black);
                    font-weight: bold;
                }

                #row-3 > .descriptionBox > .descriptionContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .descriptionBox > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .imageBox {
                    background-image: url("../src/assets/home/desktop/designed-for-everyone.jpg");
                    background-position: center;
                    height: 100%;
                    width: 830px;
                }

                #row-1 > .descriptionBox > .descriptionContainer::after {
                    content: "";
                    background-image: var(--main-accent);
                    display: block;
                    height: 304px;
                    left: -112px;
                    bottom: 304px;
                    position: relative;
                    width: 6px;
                    transform: scaleY(0);
                    transition-duration: 0.5s;
                }

                #row-1 > .descriptionBox > .descriptionContainer:hover::after {
                    transform: scaleY(1);
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #row-1 > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        max-width: 495px;
                    }

                    #row-2 > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        padding-top: 136px;
                        padding-bottom: 135px;
                        max-width: 495px;
                    }

                    #row-3 > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        padding-top: 160px;
                        padding-bottom: 159px;
                        max-width: 495px;
                    }

                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    .row {
                        flex-direction: column;
                        width: 375px;
                    }

                    .row > .imageBox {
                        background-repeat: no-repeat;
                        background-size: cover;
                        max-width: 100%;
                        order: 1;
                    }

                    .row > .descriptionBox {
                        max-width: 100%;
                        order: 2;
                    }

                    .row > .descriptionBox > .descriptionContainer > h2 {
                        font-size: var(--font-size-7);
                        letter-spacing: var(--letter-spacing-3);
                        line-height: var(--line-height-4);
                        margin-bottom: 16px;
                    }

                    .row > .descriptionBox > .descriptionContainer > p {
                        margin-bottom: 23px;
                    }

                    #row-1 {
                        height: 713px;
                    }

                    #row-1 > .imageBox {
                        min-height: 294px
                    }

                    #row-1 > .descriptionBox {
                        height: 419px;
                        padding-left: 33px;
                        padding-right: 24px;
                        padding-top: 72px;
                        padding-bottom: 72px;
                    }

                    #row-1 > .descriptionBox > .descriptionContainer {
                        height: 275px;
                        width: 318px;
                    }

                    #row-1 > .descriptionBox > .descriptionContainer:hover::after {
                        display: none;
                    }

                    #row-1 > .descriptionBox > .descriptionContainer::after {
                        content: "";
                        background-image: var(--main-accent);
                        display: block;
                        height: 6px;
                        left: 0px;
                        bottom: 341px;
                        position: relative;
                        width: 128px;
                    }

                    #row-2 {
                        height: 690px;
                    }

                    #row-2 > .imageBox {
                        min-height: 271px;
                    }

                    #row-2 > .descriptionBox {
                        height: 419px;
                        padding-left: 33px;
                        padding-right: 24px;
                        padding-top: 72px;
                        padding-bottom: 72px;
                    }

                    #row-2 > .descriptionBox > .descriptionContainer {
                        height: 275px;
                        width: 318px;
                    }

                    #row-3 {
                        height: 690px;
                    }

                    #row-3 > .imageBox {
                        minheight: 271px;
                    }

                    #row-3 > .descriptionBox {
                        height: 419px;-;
                        padding-top: 92px;
                        padding-bottom: 92px;
                    }

                    #row-3 > .descriptionBox > .descriptionContainer {
                        height: 235px;
                        width: 318px;
                    }
                }
            </style>`;
    }
}

if (!customElements.get('hero-section')) {
    customElements.define('hero-section', HeroSection)
}