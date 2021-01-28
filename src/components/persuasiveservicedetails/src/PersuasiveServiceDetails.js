export default class PersuasiveServiceDetails extends HTMLElement {
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
                <span id="detail-1" class="detail">
                    <img class="detailIcon" src="../src/assets/features/desktop/responsive.svg">
                    <div class="descriptionContainer">
                        <h3>100% Responsive</h3>
                        <p>
                            No matter which the device you’re on, our site is fully
                            responsive and stories look beautiful on any screen.
                        </p>
                    </div>
                </span>
                <span id="detail-2" class="detail">
                    <img class="detailIcon" src="../src/assets/features/desktop/no-limit.svg">
                    <div class="descriptionContainer">
                        <h3>No Photo Upload Limit</h3>
                        <p>
                            Our tool has no limits on uploads or bandwidth. Freely
                            upload in bulk and share all of your stories in one go.
                        </p>
                    </div>
                </span>
                <span id="detail-3" class="detail">
                    <img class="detailIcon" src="../src/assets/features/desktop/embed.svg">
                    <div class="descriptionContainer">
                        <h3>Available to Embed</h3>
                        <p>
                            Embed Tweets, Facebook posts, Instagram media, Vimeo
                            or YouTube videos, Google Maps, and more.
                        </p>
                    </div>
                </span>
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
                    width: 100%;
                }

                #detailsContainer {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    margin-left: auto;
                    margin-right: auto;
                    width: 77.08%;
                }

                #detailsContainer > .detail {
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                    height: 236px;
                    justify-content: space-between;
                    max-width: 350px;
                }

                #detailsContainer > .detail > .descriptionContainer {
                    height: 116px;
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
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #detailsContainer {
                        align-items: center;
                        flex-direction: column;
                        margin-left: auto;
                        margin-right: auto;
                        height: 1015px;
                    }

                    #detailsContainer {
                        max-height: 775px;
                        width: 457px;
                    }

                    .detail {
                        max-height: 211px;
                        min-width: 100%;
                    }

                    #detail-2 {
                        height: 193px;
                    }

                    #detail-1 > .detailIcon,
                    #detail-3 > .detailIcon  {
                        margin-bottom: 48px;
                    }

                    #detail-2 > .detailIcon  {
                        margin-bottom: 66px;
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    #detailsContainer {
                        max-height: 802px;
                        width: 310px;
                    }

                    .detail {
                        max-height: 236px;
                        margin-bottom: 56px;
                    }
                }
            </style>`;
    }
}

if (!customElements.get('persuasive-service-details')) {
    customElements.define('persuasive-service-details', PersuasiveServiceDetails)
}