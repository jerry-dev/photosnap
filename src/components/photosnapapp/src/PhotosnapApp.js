import Navigo from 'https://unpkg.com/navigo@7.1.2/lib/navigo.es.js';
import SiteHeader from '../../siteheader/src/SiteHeader.js';
import HomeSection from '../../homesection/src/HomeSection.js';
import StoriesSection from '../../storiessection/src/StoriesSection.js';
import FeaturesSection from '../../featuressection/src/FeaturesSection.js';
import SiteFooter from '../../sitefooter/src/SiteFooter.js';
import PricingDetails from '../../pricingdetails/src/PricingDetails.js';

class PhotosnapApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
        this.routerInit();
    }

    render() {
        this.shadowRoot.innerHTML += `
            <site-header></site-header>
            <div id="route"></div>
            <site-footer></site-footer>
        `;
    }

    routerInit() {
        const route = this.shadowRoot.querySelector('#route')
        const router = new Navigo(window.location.origin, true, '#!');
        console.log(window.location.origin);

        router
            .on({
                '/': {
                    as: 'home',
                    uses: () => route.innerHTML = `<home-section></home-section>`
                },
                '/stories': {
                    as: 'stories',
                    uses: () => route.innerHTML = `<stories-section></stories-section>`
                },
                '/features': {
                    as: 'features',
                    uses: () => route.innerHTML = `<features-section></features-section>`
                },
                '/pricing': {
                    as: 'pricing', uses: () => route.innerHTML = `<pricing-details></pricing-details>`
                },
                '*': () => route.innerHTML = `<home-section></home-section>`
        });

        router.resolve();
    }
}

if (!customElements.get('photosnap-app')) {
    customElements.define('photosnap-app', PhotosnapApp)
}