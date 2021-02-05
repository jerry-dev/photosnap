import ComparePricingPlanTable from '../../comparepricingplantable/src/ComparePricingPlanTable.js';

export default class PricingDetails extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML += `
            <generic-hero-section
                desktopImage="../src/assets/pricing/desktop/hero.jpg"
                tabletImage="../src/assets/pricing/tablet/hero.jpg"
                mobileImage="../src/assets/pricing/mobile/hero.jpg"
                title="PRICING"
                paragraph="Create a your stories, Photosnap is a platform for photographers and visual storytellers. It’s the simple way to create and share your photos."
            ></generic-hero-section>
            <compare-pricing-plan-table></compare-pricing-plan-table>
            <beta-cta-banner></beta-cta-banner>
        `;
    }
}

if (!customElements.get('pricing-details')) {
    customElements.define('pricing-details', PricingDetails)
}