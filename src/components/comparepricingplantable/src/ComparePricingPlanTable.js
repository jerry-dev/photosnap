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

                <table id="mobileTable">
                    <thead>
                        <tr>
                            <th>THE FEATURES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="rowHeader"><th>UNLIMITED STORY POSTING</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>UNLIMITED PHOTO UPLOAD</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>EMBEDDING CUSTOM CONTENT</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>CUSTOMIZE METADATA</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>ADVANCED METRICS</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>PHOTO DOWNLOADS</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>SEARCH ENGINE INDEXING</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>CUSTOM ANALYTICS</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>
                    </tbody>
                </table>
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
                *, *::before, *::after { margin: 0; padding: 0; }

                #mobileTable {
                    display: none;
                }

                :host {
                    display: block;
                    padding-bottom: 160px;
                    padding-left: 24.652%;
                    padding-right: 24.652%;
                    padding-top: 160px;
                }

                #container {
                    display: grid;
                    justify-content: center;
                    width: 100%;
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

                #largeTable > thead > tr,
                #largeTable > tbody > tr {
                    height: 62.5px;
                }

                #largeTable > thead > tr > #head-1 {
                    padding-left: 24px;
                    text-align: left;
                    width: 287px;
                }

                #largeTable > thead > tr > #head-2,
                #largeTable > thead > tr > #head-3,
                #largeTable > thead > tr > #head-4 {
                    width: 140px;
                    text-align: center;
                }

                #largeTable > tbody > tr > .check {
                    align-items: center;
                    text-align: center;
                }

                #largeTable > tbody > tr > .theFeaturesColumn {
                    padding-left: 24px;
                }




                #mobileTable > thead > tr > th {
                    text-align: left;
                    padding-bottom: 23px;
                }

                #mobileTable > tbody > tr {
                    align-items: center;
                }

                #mobileTable > tbody > .rowHeader {
                    height: 16px;
                    padding-bottom: 16px;
                    padding-top: 23px;
                }

                #mobileTable > tbody > .rowInfo {
                    align-items: baseline;
                    border-bottom: 1px solid var(--light-grey);
                    height: 33px;
                    padding-bottom: 24px;
                    padding-right: 46px;
                }

                #mobileTable > tbody > tr > td {
                    border: none;
                    display: flex;
                    flex-direction: column;
                }

                #mobileTable > tbody > tr > td:nth-child(1) {
                    margin-right: 68px;
                }

                #mobileTable > tbody > tr > td:nth-child(2) {
                    margin-right: 80px;
                }

                #mobileTable > tbody > tr {
                    display: flex;
                    max-width: 272px;
                    height: 33px;
                    justify-content: flex-start;
                }

                #mobileTable > tbody > tr > td > span {
                    align-items: start
                    color: var(--opaque-pure-black-3);
                    font-size: var(--font-size-8);
                    letter-spacing: var(--letter-spacing-4);
                }

                #mobileTable > tbody > tr > td > img {
                    height: 12px;
                    margin-top: 8px;
                    width: 16px;
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
                        padding-left: 5.3%;
                        padding-right: 5.3%;
                        padding-top: 112px;
                    }

                    #largeTable > thead > tr,
                    #largeTable > tbody > tr {
                        height: 63px;
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    #container > h2,
                    #largeTable {
                        display: none;
                    }

                    #mobileTable {
                        display: block;
                    }

                    :host {
                        display: block;
                        padding-bottom: 64px;
                        padding-left: 29px;
                        padding-right: 29px;
                        padding-top: 64px;
                    }
                }
            </style>`;
    }
}

if (!customElements.get('compare-pricing-plan-table')) {
    customElements.define('compare-pricing-plan-table', ComparePricingPlanTable)
}