export default class ComparePricingPlanTable extends HTMLElement {
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
            <div id="container">
                <h2>COMPARE</h2>
                <table id="largeTable">
                    <thead>
                        <tr>
                            <th id="head-1">THE FEATURES</th>
                            <th id="head-2">BASIC</th>
                            <th id="head-3">PRO</th>
                            <th id="head-4">BUSINESS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="theFeaturesColumn">UNLIMITED STORY POSTING</td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">UNLIMITED PHOTO UPLOAD</td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">EMBEDDING CUSTOM CONTENT</td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">CUSTOMIZE METADATA</td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">ADVANCED METRICS</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">PHOTO DOWLOADS</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">SEARCH ENGINE INDEXING</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">CUSTOM ANALYTICS</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    css() {
        this.defaultCSS();
        this.tabletLayoutCSS();
    }

    defaultCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0; padding: 0; }

                :host {
                    display: block;
                    padding-bottom: 160px;
                    padding-left: 24.652%;
                    padding-right: 24.652%;
                    padding-top: 160px;
                }

                #container {
                    display: grid;
                    flex-direction: column;
                    justify-content: center;
                }

                #container > h2 {
                    font-size: var(--font-size-5);
                    margin-bottom: 56px;
                    margin-left: auto;
                    margin-right: auto;
                }

                #container > table {
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    width: 100%;
                }

                table, td {
                    border-collapse: collapse;
                    border-bottom: 1px solid var(--light-grey);
                }

                #container > table > thead > tr {
                    border-bottom: 1px solid var(--pure-black);
                }

                #container > table > thead > tr,
                #container > table > tbody > tr {
                    height: 62.5px;
                }

                #container > table > thead > tr > #head-1 {
                    padding-left: 24px;
                    text-align: left;
                    width: 287px;
                }

                #container > table > thead > tr > #head-2,
                #container > table > thead > tr > #head-3,
                #container > table > thead > tr > #head-4 {
                    width: 140px;
                    text-align: center;
                }

                #container > table > tbody > tr > .theFeaturesColumn {
                    padding-left: 24px;
                }

                #container > table > tbody > tr > .check {
                    text-align: center;
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        display: block;
                        padding-bottom: 112px;
                        padding-left: 5.3%;
                        padding-right: 5.3%;
                        padding-top: 112px;
                    }

                    #container > table > thead > tr,
                    #container > table > tbody > tr {
                        height: 63px;
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    #container > table > tbody > tr > .theFeaturesColumn {
                        display: block;
                    }
                }
            </style>`;
    }
}

if (!customElements.get('compare-pricing-plan-table')) {
    customElements.define('compare-pricing-plan-table', ComparePricingPlanTable)
}