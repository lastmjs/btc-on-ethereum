import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';

type State = {
    wbtcTotalSupply: BigNumber | 'NOT_SET';
};

const InitialState: Readonly<State> = {
    wbtcTotalSupply: 'NOT_SET'
};

class BEApp extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    constructor() {
        super();

        // TODO load the balances

        const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead');

        (async () => {
            const wbtcTotalSupply = await getWBTCTotalSupply(provider);
            this.store.wbtcTotalSupply = wbtcTotalSupply.div(10 ** 8);
        })();
    }

    render(state: Readonly<State>) {
        return html`
            <h1>BTC on Ethereum</h1>

            <br>

            <div>Total: ${state.wbtcTotalSupply}</div>

            <br>

            <div>wBTC: ${state.wbtcTotalSupply === 'NOT_SET' ? 'Loading...' : state.wbtcTotalSupply}</div>
        `;
    }
}

window.customElements.define('be-app', BEApp);

// TODO be very careful with numbers
async function getWBTCTotalSupply(provider: Readonly<ethers.providers.BaseProvider>): Promise<BigNumber> {
    const wbtcContractAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

    const wbtcABI = [
        'function totalSupply() public view returns (uint256)'
    ];

    const wbtcContract = new ethers.Contract(wbtcContractAddress, wbtcABI, provider);

    return await wbtcContract.totalSupply();
}