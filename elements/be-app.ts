import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';

type State = {
    wbtcTotalSupply: number | 'NOT_SET';
};

const InitialState: Readonly<State> = {
    wbtcTotalSupply: 'NOT_SET'
};

class BEApp extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    constructor() {
        super();

        // TODO load the balances
    }

    render(state: Readonly<State>) {
        return html`
            <h1>BTC on Ethereum</h1>

            <br>

            <div>wBTC: ${state.wbtcTotalSupply}</div>
        `;
    }
}

window.customElements.define('be-app', BEApp);