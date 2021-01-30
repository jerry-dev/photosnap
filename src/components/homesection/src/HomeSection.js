import storyCardGenerator from '../../utils/StoryCardGenerator.js';
import HeroSection from '../../herosection/src/HeroSection.js';
import StoryCard from '../../storycard/src/StoryCard.js';
import PersuasiveServiceDetails from '../../persuasiveservicedetails/src/PersuasiveServiceDetails.js';

export default class HomeSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.cardMetaData = [
            {
                sections: ["home", "stories"],
                title: "The Mountains", author: "John Appleseed",
                desktopImage: "../src/assets/stories/desktop/mountains.jpg",
                tabletImage: "../src/assets/stories/table/mountains.jpg",
                mobileImage: "../src/assets/stories/mobile/mountains.jpg"
            },
            {
                sections: ["home", "stories"],
                title: "Sunset Cityscapes", author: "Benjamin Cruz",
                desktopImage: "../src/assets/stories/desktop/cityscapes.jpg",
                tabletImage: "../src/assets/stories/table/cityscapes.jpg",
                mobileImage: "../src/assets/stories/mobile/cityscapes.jpg"
            },
            {
                sections: ["home", "stories"],
                title: "18 Days Voyage", author: "Alexei Borodin",
                desktopImage: "../src/assets/stories/desktop/18-days-voyage.jpg",
                tabletImage: "../src/assets/stories/table/18-days-voyage.jpg",
                mobileImage: "../src/assets/stories/mobile/18-days-voyage.jpg"
            },
            {
                sections: ["home", "stories"],
                title: "Architecturals", author: "Samantha Brooke",
                desktopImage: "../src/assets/stories/desktop/architecturals.jpg",
                tabletImage: "../src/assets/stories/table/architecturals.jpg",
                mobileImage: "../src/assets/stories/mobile/architecturals.jpg"
            }
        ];
    }

    connectedCallback() {
        this.render();
        this.cardGenerator();
    }

    render() {
        this.html();
        this.css();
    }

    html()  {
        let html = ``;
        html += `<hero-section></hero-section>`;
        html += `<div id="storyCardsContainer">${storyCardGenerator("home", this.cardMetaData)}</div>`;
        html += `<persuasive-service-details></persuasive-service-details>`;
        this.shadowRoot.innerHTML += html;
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