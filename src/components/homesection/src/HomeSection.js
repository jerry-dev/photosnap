import storyCardGenerator from '../../utils/StoryCardGenerator.js';
import cardMetaData from '../../../data/cardMetaData.js';
import HeroSection from '../../herosection/src/HeroSection.js';
import StoryCard from '../../storycard/src/StoryCard.js';
import PersuasiveServiceDetails from '../../persuasiveservicedetails/src/PersuasiveServiceDetails.js';

export default class HomeSection extends HTMLElement {
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

    html()  {
        this.shadowRoot.innerHTML += `
            <hero-section></hero-section>
            <div id="storyCardsContainer">${storyCardGenerator("home", cardMetaData, "time")}</div>
            <persuasive-service-details displayOff=".group-2"></persuasive-service-details>
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
                *, *::before, *::after { margin: 0; padding: 0; }

                #storyCardsContainer {
                    display: grid;
                    grid-template-columns: repeat(4, 25%);
                    grid-template-rows: 500px;
                }

                story-card {
                    grid-column: span 1;
                }

                persuasive-service-details {
                    padding-bottom: 120px;
                    padding-top: 120px;
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #storyCardsContainer {
                        grid-template-columns: repeat(2, 50%);
                        grid-template-rows: repeat(2, 500px);
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    persuasive-service-details {
                        padding-bottom: 80px;
                        padding-top: 80px;
                    }

                    #storyCardsContainer {
                        grid-template-columns: repeat(1, 100%);
                        grid-template-rows: repeat(4, 500px);
                    }
                }
            </style>`;
    }
}

if (!customElements.get('home-section')) {
    customElements.define('home-section', HomeSection)
}