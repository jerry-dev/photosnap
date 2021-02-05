export default class PersuasiveServiceDetails extends HTMLElement {
    static get observedAttributes() {
        return [ 'displayOff' ]
    }
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
            <div id="detailsContainer">
                <article id="detail-1" class="detail group-1">
                    <img class="detailIcon" src="../src/assets/features/desktop/responsive.svg">
                    <div class="descriptionContainer">
                        <h3>100% Responsive</h3>
                        <p>
                            No matter which the device you’re on, our site is fully
                            responsive and stories look beautiful on any screen.
                        </p>
                    </div>
                </article>
                <article id="detail-2" class="detail group-1">
                    <img class="detailIcon" src="../src/assets/features/desktop/no-limit.svg">
                    <div class="descriptionContainer">
                        <h3>No Photo Upload Limit</h3>
                        <p>
                            Our tool has no limits on uploads or bandwidth. Freely
                            upload in bulk and share all of your stories in one go.
                        </p>
                    </div>
                </article>
                <article id="detail-3" class="detail group-1">
                    <img class="detailIcon" src="../src/assets/features/desktop/embed.svg">
                    <div class="descriptionContainer">
                        <h3>Available to Embed</h3>
                        <p>
                            Embed Tweets, Facebook posts, Instagram media, Vimeo
                            or YouTube videos, Google Maps, and more.
                        </p>
                    </div>
                </article>
                <article id="detail-4" class="detail group-2">
                    <img class="detailIcon" src="../src/assets/features/desktop/custom-domain.svg">
                    <div class="descriptionContainer">
                        <h3>100% Responsive</h3>
                        <p>
                            With Photosnap subscriptions you can host your stories on your own domain.
                            You can also remove our branding!
                        </p>
                    </div>
                </article>
                <article id="detail-5" class="detail group-2">
                    <img class="detailIcon" src="../src/assets/features/desktop/boost-exposure.svg">
                    <div class="descriptionContainer">
                        <h3>No Photo Upload Limit</h3>
                        <p>
                            Users that viewed your story or gallery can easily get notifed of new and
                            featured stories with our built in mailing list.
                        </p>
                    </div>
                </article>
                <article id="detail-6" class="detail group-2">
                    <img class="detailIcon" src="../src/assets/features/desktop/drag-drop.svg">
                    <div class="descriptionContainer">
                        <h3>Available to Embed</h3>
                        <p>
                            Easily drag and drop your image and get beautiful shots everytime. No over
                            the top tooling to add friction to creating stories.
                        </p>
                    </div>
                </article>
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
                    background-color: var(--pure-white);
                    display: block;
                    max-width: 100%;
                    padding-top: 160px;
                    padding-bottom: 160px;
                    padding-left: 12.5%;
                    padding-right: 12.5%;
                }

                #detailsContainer {
                    display: grid;
                    grid-template-columns: repeat(3, 31.53%);
                    grid-auto-rows: auto;
                    grid-column-gap: 2.70%;
                    grid-row-gap: 104px;
                    width: 100%;
                }
                
                #detailsContainer > .detail {
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                    grid-column: span 1;
                }

                #detailsContainer > .detail > img {
                    margin-bottom: 48px;
                }

                #detailsContainer > #detail-2 > img {
                    margin-top: 15px;
                    margin-bottom: 66px;
                }

                #detailsContainer > .detail > .descriptionContainer > h3 {
                    font-size: var(--font-size-3);
                    font-weight: bold;
                    margin-bottom: 16px;
                    text-align: center;
                }

                #detailsContainer > .detail > .descriptionContainer > p {
                    font-size: var(--font-size-2);
                    text-align: center;
                    line-height: var(--line-height-2);
                }

                #detailsContainer > ${this.getAttribute('displayOff')} {
                    display: none;
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {

                    :host {
                        padding-bottom: 112px;
                        padding-top: 112px;
                        padding-left: 5.20%;
                        padding-right: 5.20%;
                    }

                    #detailsContainer {
                        grid-template-columns: repeat(2, 49.13%);
                        grid-auto-rows: auto;
                        grid-column-gap: 0.99%;
                        grid-row-gap: 83px;
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    :host {
                        padding-bottom: 91px;
                        padding-top: 64px;
                        padding-left: 8.8%;
                        padding-right: 8.8%;
                    }

                    #detailsContainer {
                        grid-template-columns: repeat(1, 100%);
                        grid-auto-rows: auto;
                        grid-row-gap: 56px;
                    }
                }
            </style>`;
    }
}

if (!customElements.get('persuasive-service-details')) {
    customElements.define('persuasive-service-details', PersuasiveServiceDetails)
}