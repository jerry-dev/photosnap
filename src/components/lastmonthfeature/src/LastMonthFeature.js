export default class LastMonthFeature extends HTMLElement {
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
            <div id="featuredStory">
                <div id="featuredStoryContainer">
                    <h3>LAST MONTH’S FEATURED STORY</h3>
                    <h2>HAZY FULL MOON OF APPALACHIA</h2>
                    <small id="articleMetaData"><time>March 2nd 2020</time>&nbsp;<address rel="author"> by John Appleseed</address></small>
                    <p>
                        The dissected plateau area, while not actually made up of geological
                        mountains, is popularly called "mountains," especially in eastern
                        Kentucky and West Virginia, and while the ridges are not high, the
                        terrain is extremely rugged.
                    </p>
                    <a id="cta" href="#000">
                        <p>READ THE STORY</p>
                        <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
                    </a>
                </div>
            </div>
        `;
    }

    css() {
        this.defaultCSS();
    }

    defaultCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                #featuredStory {
                    background-image: url('../src/assets/stories/desktop/moon-of-appalacia.jpg');
                    background-position: center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    max-width: 100%;
                    padding-bottom: 122px;
                    padding-left: 7.78%;
                    padding-top: 122px;
                }

                #featuredStory:hover {
                    background-image:
                        var(--secondary-accent),
                        url('../src/assets/stories/desktop/moon-of-appalacia.jpg');
                }

                #featuredStory > #featuredStoryContainer {
                    color: var(--pure-white);
                    max-width: 387px;
                }

                #featuredStory > #featuredStoryContainer > h3 {
                    font-size: var(--font-size-1);
                    letter-spacing: var(--letter-spacing-1);
                    margin-bottom: 24px;
                }

                #featuredStory > #featuredStoryContainer > h2 {
                    font-size: var(--font-size-5);
                    letter-spacing: var(--letter-spacing-2);
                    margin-bottom: 16px;
                }

                #featuredStory > #featuredStoryContainer > #articleMetaData {
                    display: flex;
                    flex-direction: row;
                    font-size: var(--font-size-6);
                    margin-bottom: 24px;
                }

                #featuredStory > #featuredStoryContainer > #articleMetaData > time {
                    opacity: 0.75;
                }

                #featuredStory > #featuredStoryContainer > #articleMetaData > address {
                    font-style: normal;
                }

                #featuredStory > #featuredStoryContainer > p {
                    color: var(--opaque-pure-white-2);
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);
                    margin-bottom: 24px;
                }

                #featuredStory > #featuredStoryContainer > #cta {
                    align-items: flex-start;
                    cursor: pointer;
                    display: flex;
                    text-decoration: none;
                }
    
                #featuredStory > #featuredStoryContainer > #cta > p {
                    color: var(--pure-white);
                    font-size: var(--font-size-1);
                    letter-spacing: var(--letter-spacing-1);
                    margin-right: 16px;
                    white-space: nowrap;
                }

                #featuredStory > #featuredStoryContainer > #cta {
                    color: var(--pure-white);
                    font-weight: bold;
                }

                #featuredStory > #featuredStoryContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-white);
                }
            </style>
        `;
    }
}

if (!customElements.get('last-month-feature')) {
    customElements.define('last-month-feature', LastMonthFeature)
}