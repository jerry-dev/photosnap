import LastMonthFeature from '../../lastmonthfeature/src/LastMonthFeature.js';
import StoryCard from '../../storycard/src/StoryCard.js';
import cardMetaData from '../../../data/cardMetaData.js';
import storyCardGenerator from '../../utils/StoryCardGenerator.js';

export default class StoriesSection extends HTMLElement {
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
        let markup = ``;
        markup += `<last-month-feature></last-month-feature>`;
        markup += `<div id="storyCardsContainer">${storyCardGenerator("stories", cardMetaData)}</div>`;
        this.shadowRoot.innerHTML +=  markup;
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
                    grid-auto-rows: 500px;
                }

                story-card {
                    grid-column: span 1;
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
                    }
                }
            </style>`;
    }
}

if (!customElements.get('stories-section')) {
    customElements.define('stories-section', StoriesSection)
}
