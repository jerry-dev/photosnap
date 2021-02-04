import GenericHeroSection from '../../genericherosection/src/GenericHeroSection.js';
import PersuasiveServiceDetails from '../../persuasiveservicedetails/src/PersuasiveServiceDetails.js';
import BetaCTABanner from '../../betactabanner/src/BetaCTABanner.js';

export default class FeaturesSection extends HTMLElement {
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
                desktopImage="../src/assets/features/desktop/hero.jpg"
                tabletImage="../src/assets/features/tablet/hero.jpg"
                mobileImage="../src/assets/features/mobile/hero.jpg"
                title="FEATURES"
                paragraph="We make sure all of our features are designed to be loved by every aspiring and even professional photograpers who wanted to share their stories."
            ></generic-hero-section>
            <persuasive-service-details></persuasive-service-details>
            <beta-cta-banner></beta-cta-banner>
        `;
    }
}

if (!customElements.get('features-section')) {
    customElements.define('features-section', FeaturesSection)
}