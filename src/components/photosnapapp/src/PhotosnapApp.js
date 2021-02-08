import {Router} from '../../utils/router/dist/vaadin-router.js';
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
        // this.routerInitialize();
    }

    // render() {
    //     this.shadowRoot.innerHTML += `
    //         <div id="appContainer">
    //             <site-header></site-header>
    //             <div id="outlet"></div>
    //             <site-footer></site-footer>
    //         </div>
    //     `;
    // }

    render() {
        this.shadowRoot.innerHTML += `
            <div id="appContainer">
                <site-header></site-header>
                <pricing-details></pricing-details>
                <site-footer></site-footer>
            </div>
        `;
    }

    routerInitialize() {
        const outlet = this.shadowRoot.querySelector('#outlet');
        const router = new Router(outlet);

        router.setRoutes([
            { path: '/', component: 'home-section' },
            { path: '/stories', component: 'stories-section' },
            { path: '/features', component: 'features-section' },
            { path: '/pricing', component: 'pricing-details' },
        ]);
    }
}

if (!customElements.get('photosnap-app')) {
    customElements.define('photosnap-app', PhotosnapApp)
}