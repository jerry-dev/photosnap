export default class StoryCard extends HTMLElement {
    static get observedAttributes() {
        return ['title, author, desktopImage, tabletImage, mobileImage'];
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[attrName] = this.getAttribute(attrName);
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.html();
        this.css();
    }

    html() {
        this.shadowRoot.innerHTML +=
        `<div id="details">
            <h3>${this.getAttribute('title')}</h3>
            <p>by ${this.getAttribute('author')}</p>
            <a id="cta" href="#000">
                <p>READ STORY</p>
                <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
            </a>
        </div>
        `;
    }

    css() {
        this.shadowRoot.innerHTML += `
            <style>
            *, *::before, *::after { margin: 0; padding: 0; }

            :host {
                align-items: center;
                background-image: url('${this.getAttribute('desktopImage')}');
                background-position: center;
                color: var(--pure-white);
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                transition-property: transform;
                transition-duration: .2s;
            }

            :host(:hover) {
                transform: translateY(-20px);
            }

            :host(:hover)::after {
                content: "";
                background-image: var(--main-accent);
                display: block;
                height: 6px;
                position: relative;
                width: 100%;
            }

            #details {
                width: 77.78%;
                margin-bottom: 40px;
            }

            #details > h3 {
                font-weight: bold;
                font-size: var(--font-size-3);
                margin-bottom: 4px;
            }

            #details > p {
                font-size: var(--font-size-6);
                margin-bottom: 16px;
            }

            #cta {
                align-items: center;
                border-top: 1px solid var(--opaque-pure-white);
                cursor: pointer;
                display: flex;
                justify-content: center;
                max-width: 168px;
                max-height: 16px;
                text-decoration: none;
                max-width: 100%;
                padding-top: 20px;
            }

            #cta > p {
                color: var(--pure-white);
                font-size: var(--font-size-1);
                letter-spacing: var(--letter-spacing-1);
                margin-right: auto;
                white-space: nowrap;
            }
            </style>
        `;
    }
}

if (!customElements.get('story-card')) {
    customElements.define('story-card', StoryCard)
}