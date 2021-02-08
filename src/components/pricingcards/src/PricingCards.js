export default class PricingCards extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.basicMonthlyPlanPrice = 19.00;
        this.proMonthlyPlanPrice = 39.00;
        this.businessMonthlyPlanPrice = 99.00;
        this.isAnnual = false;
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
            <div id="toggleContainer">
                <label for="intervalToggle">
                    <span>Monthly</span>
                    <input type="checkbox" id="intervalToggle">
                    <span id="opening"></span>
                    <span>Annual</span>
                </label>
            </div>

            <div id="cardContainer">
                <div id="basicCard" class="card">
                    <h2>Basic</h2>
                    <p>
                        Includes basic usage of our platform. Recommended for new and aspiring photographers.
                    </p>
                    <div class="planPrice">${this.getPricePlanDetails('basic').price}</div>
                    <span class="interval">per ${this.getPricePlanDetails('basic').interval}</span>
                    <button type="button">PRICE PLAN</button>
                </div>

                <div id="proCard" class="card">
                    <h2>Pro</h2>
                    <p>
                        More advanced features available. Recommended for photography veterans and professionals.
                    </p>
                    <div class="planPrice">${this.getPricePlanDetails('pro').price}</div>
                    <span class="interval">per ${this.getPricePlanDetails('pro').interval}</span>
                    <button type="button">PRICE PLAN</button>
                </div>

                <div id="businessCard" class="card">
                    <h2>Business</h2>
                    <p>
                        Additional features available such as more detailed metrics. Recommended for business owners.
                    </p>
                    <div class="planPrice">${this.getPricePlanDetails('business').price}</div>
                    <span class="interval">per ${this.getPricePlanDetails('business').interval}</span>
                    <button type="button">PRICE PLAN</button>
                </div>
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
                    display: flex;
                    flex-direction: column;
                    max-width: 100%;
                    padding-left: 11.458%;
                    padding-right: 11.458%;
                }

                #cardContainer {
                    display: flex;
                    flex-direction: row;
                    max-width: 100%;
                }

                .card {
                    align-items: center;
                    background-color: var(--light-grey-2);
                    display: flex;
                    flex-direction: column;
                    padding-left: 3.604%;
                    padding-right: 3.604%;
                    max-width: 350px;
                    min-width: 70px;
                }

                .card > h2 {
                    font-size: var(--font-size-4);
                    line-height: var(--line-height-2);
                    margin-bottom: 18px;
                }

                .card > p {
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);  
                    margin-bottom: 40px;
                    max-width: 100%;
                    text-align: center;                    
                }

                .card > .planPrice {
                    font-size: var(--font-size-5);
                    font-weight: bold;
                }

                .card > .interval {
                    margin-bottom: 40px;
                    line-height: var(--line-height-2);
                }

                .card > button {
                    background-color: var(--pure-black);
                    border: none;
                    color: var(--pure-white);
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    height: 40px;
                    letter-spacing: var(--letter-spacing-1);
                    width: 100%;
                }

                #basicCard,
                #businessCard {
                    padding-bottom: 40px;
                    padding-top: 56px;
                    margin-bottom: 31.5px;
                    margin-top: 31.5px;
                }

                #proCard > button:active,
                #basicCard > button:active,
                #businessCard > button:active {
                    color: var(--pure-black);
                    background-color: var(--light-grey);
                    outline: none;
                }

                #proCard {
                    background-color: var(--pure-black);
                    margin-right: 2.083%;
                    margin-left: 2.083%;
                    padding-bottom: 71px;
                    padding-top: 88px;
                    position: relative;
                }

                #proCard::before {
                    content: "";
                    background-image: var(--main-accent);
                    height: 6px;
                    position: absolute;
                    top: 0px;
                    width: 100%;
                }

                #proCard > h2 {
                    align-items: center;
                    color: var(--pure-white);
                }

                #proCard > p,
                #proCard > .interval {
                    color: var(--opaque-pure-white-2);
                }

                #proCard > .planPrice {
                    color: var(--pure-white);
                }

                #proCard > button {
                    color: var(--pure-black);
                    background-color: var(--pure-white);
                }
            </style>
        `;
    }

    tabletLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        padding-left: 5.65%;
                        padding-right: 5.65%;
                    }
    
                    #cardContainer {
                        display: flex;
                        flex-direction: column;
                    }

                    .card {
                        max-width: 689px;
                        min-width: 137.8px;
                    }
    
                    #basicCard,
                    #proCard,
                    #businessCard {
                        padding: 0;
                        margin: 0;
                        display: grid;
                        grid-template-column: minmax(54px, 270px) minmax(55.6px, 278px);
                        grid-template-rows: repeat(3, auto);
                        grid-column-gap: 6.901%;
                        padding-bottom: 40px;
                        padding-top: 42px;
                        padding-left: 6%;
                        padding-right: 7%;
                    }

                    #basicCard > p,
                    #proCard > p,
                    #businessCard > p {
                        text-align: left;
                        margin-bottom: 32px;
                    }

                    .card > .planPrice {
                        font-size: clamp(var(--font-size-5)/2, 6vw, var(--font-size-5));
                        grid-column: 2;
                        grid-row: 1;
                        text-align: right;
                        margin-bottom: 0;
                    }

                    .card > .interval {
                        text-align: right;
                        margin-bottom: auto;
                    }

                    .card > button {
                        max-width: 270px;
                    }

                    #proCard {
                        margin-top: 24px;
                        margin-bottom: 24px;
                        position: relative;
                    }

                    #proCard::before {
                        content: none;
                    }
                    
                    #proCard::after {
                        content: "";
                        background-image: var(--main-accent);
                        height: 100%;
                        position: absolute;
                        top: 0px;
                        width: 6px;
                    }
                }
            </style>`;
    }

    mobileLayoutCSS() {
        this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    :host {
                        padding-left: 7.733%;
                        padding-right: 7.733%;
                    }

                    #basicCard,
                    #proCard,
                    #businessCard {
                        align-items: center;
                        display: flex;
                        flex-direction: column;
                        padding-left: 6.604%;
                        padding-right: 6.918%;
                        padding-top: 56px;
                    }

                    #proCard::after {
                        content: none;
                    }

                    #proCard::before {
                        content: "";
                    }

                    #basicCard > p,
                    #proCard > p,
                    #businessCard > p {
                        text-align: center;
                        margin-bottom: 40px;
                    }

                    .card > .planPrice {
                        font-size: var(--font-size-5);
                    }

                    .card > .interval {
                        margin-bottom: 40px;
                    }
                }
            </style>`;
    }

    getPricePlanDetails(plan) {
        let details = { price: null, interval: null };

        switch (plan) {
            case 'basic':
                if (!this.isAnnual) {
                    details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.basicMonthlyPlanPrice);
                    details.interval = `month`;
                } else {
                    details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.basicMonthlyPlanPrice*10);
                    details.interval = `year`;
                }
            break;
            case 'pro':
                if (!this.isAnnual) {
                    details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.proMonthlyPlanPrice);
                    details.interval = `month`;
                } else {
                    details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.proMonthlyPlanPrice*10);
                    details.interval = `year`;
                }
            break;
            case 'business':
                if (!this.isAnnual) {
                    details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.businessMonthlyPlanPrice);
                    details.interval = `month`;
                } else {
                    details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.businessMonthlyPlanPrice*10);
                    details.interval = `year`;
                }
            break;
        }
        return details;
    }
}

if (!customElements.get('pricing-cards')) {
    customElements.define('pricing-cards', PricingCards)
}