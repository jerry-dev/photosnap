import HeroSection from '../../herosection/src/HeroSection.js';
import StoryCard from '../../storycard/src/StoryCard.js';
// import PersuasiveServiceDetails from '../../storycard/src/PersuasiveServiceDetails.js';

export default class HomeSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
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
        html += `<hero-section></hero-section>
        <div id="storyCardsContainer">
            ${this.cardGenerator()}
        </div>`;
        this.shadowRoot.innerHTML += html;
    }

    cardGenerator() {
        const metaData = [
            {
                title: "The Mountains", author: "John Appleseed",
                desktopImage: "../src/assets/stories/desktop/mountains.jpg",
                tabletImage: "../src/assets/stories/table/mountains.jpg",
                mobileImage: "../src/assets/stories/mobile/mountains.jpg"
            },
            {
                title: "Sunset Cityscapes", author: "Benjamin Cruz",
                desktopImage: "../src/assets/stories/desktop/cityscapes.jpg",
                tabletImage: "../src/assets/stories/table/cityscapes.jpg",
                mobileImage: "../src/assets/stories/mobile/cityscapes.jpg"
            },
            {
                title: "18 Days Voyage", author: "Alexei Borodin",
                desktopImage: "../src/assets/stories/desktop/18-days-voyage.jpg",
                tabletImage: "../src/assets/stories/table/18-days-voyage.jpg",
                mobileImage: "../src/assets/stories/mobile/18-days-voyage.jpg"
            },
            {
                title: "Architecturals", author: "Samantha Brooke",
                desktopImage: "../src/assets/stories/desktop/architecturals.jpg",
                tabletImage: "../src/assets/stories/table/architecturals.jpg",
                mobileImage: "../src/assets/stories/mobile/architecturals.jpg"
            }
        ];

        let html = ``;

        for (let i = 0; i < 4; i++) {
            
            html += `<story-card
                title="${metaData[i].title}"
                author="${metaData[i].author}"
                desktopImage="${metaData[i].desktopImage}"
                tabletImage="${metaData[i].tabletImage}"
                mobileImage="${metaData[i].mobileImage}"
            ></story-card>`;
        }

        return html;
    }

    css() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0; padding: 0; }

                #storyCardsContainer {
                    display: grid;
                    grid-template-columns: repeat(4, 25%);
                    grid-template-row: 100%;
                    height: 500px;
                }

                story-card {
                    grid-column: span 1;
                }
            </style>
        `;
    }
}

if (!customElements.get('home-section')) {
    customElements.define('home-section', HomeSection)
}