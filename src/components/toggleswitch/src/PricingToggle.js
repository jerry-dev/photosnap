export default class PricingToggle extends HTMLElement {
    static get observedAttributes() {
        return ['checked'];
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
        this.scripts();
    }

    html() {
        this.shadowRoot.innerHTML += `
        <div id="toggleContainer">
            <input type="checkbox" id="intervalToggle">
            <label for="intervalToggle">
                <span id="monthly">Monthly</span>
                <span id="opening"></span>
                <span id="annual">Annual</span>
            </label>
        </div>
        `;
    }

    css() {
        this.defaultCSS();
    }

    defaultCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0; padding: 0; }

                :host {
                    max-width: 100%;
                }

                label {
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                }

                #toggleContainer > input[type="checkbox"] {
                    display: none;
                }

                #toggleContainer {
                    margin-left: auto;
                    margin-right: auto;
                    max-width: 255px;
                }

                #toggleContainer > label #monthly {
                    font-size: 18px;
                    font-weight: bold;
                    line-height: 25px;
                    margin-right: 32px;
                }

                #toggleContainer > label #annual {
                    font-size: 18px;
                    font-weight: bold;
                    line-height: 25px;
                    margin-left: 32px;
                }

                #toggleContainer > label #opening {
                    background-color: var(--light-grey);
                    border-radius: 16px;
                    display: block;
                    position: relative;
                    height: 32px;
                    width: 64px;
                }       

                #toggleContainer > label #opening::before,
                #toggleContainer > label #opening::after {
                    content: "";
                    position: absolute;
                }
                
                #toggleContainer > label #opening::before {
                    cursor: pointer;
                    top: 4px;
                    left: 4px;
                    width: 24px;
                    height: 24px;
                    background-color: var(--pure-black);
                    border-radius: 50%;
                    z-index: 1;
                    transition: transform 0.3s;
                }

                #toggleContainer > input[type="checkbox"]:checked + label #opening::before {
                    transform: translateX(27px);
                    background-color: var(--light-grey);
                }

                #toggleContainer > input[type="checkbox"]:checked + label #opening {
                    background-color: var(--pure-black);
                }

                :host([checked="true"]) > #toggleContainer > label #annual {
                    color: var(--pure-black);
                }

                :host([checked="true"]) > #toggleContainer > label #monthly {
                    color: var(--opaque-pure-black-3);
                }

                :host([checked="false"]) > #toggleContainer > label #monthly {
                    color: var(--pure-black);
                }

                :host([checked="false"]) > #toggleContainer > label #annual {
                    color: var(--opaque-pure-black-3);
                }
            </style>
        `;
    }

    scripts() {
        this.toggleFlip();
    }

    toggleFlip() {
        const theInput = this.shadowRoot.querySelector('#toggleContainer > input');

        theInput.addEventListener('click', () => {
            if (theInput.checked) {
                this.setAttribute('checked', true);
            } else {
                this.setAttribute('checked', false);
            }
        });
    }
}

if (!customElements.get('pricing-toggle')) {
    customElements.define('pricing-toggle', PricingToggle)
}