import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';

type State = {
    readonly btcTokens: ReadonlyArray<BTCToken>;
};

type BTCToken = {
    readonly name: string;
    readonly decimals: number;
    readonly totalSupply: BigNumber | 'NOT_SET';
    readonly contractAddress: string;
    readonly abi: Array<string>;
    readonly functionName: string;
};

const InitialState: Readonly<State> = {
    btcTokens: [
        {
            name: 'wBTC',
            decimals: 8,
            totalSupply: 'NOT_SET',
            contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            abi: [
                'function totalSupply() public view returns (uint256)'   
            ],
            functionName: 'totalSupply'
        },
        {
            name: 'imBTC',
            decimals: 8,
            totalSupply: 'NOT_SET',
            contractAddress: '0x3212b29E33587A00FB1C83346f5dBFA69A458923',
            abi: [
                'function totalSupply() external view returns (uint256)'
            ],
            functionName: 'totalSupply'
        }
    ]
};

class BEApp extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    constructor() {
        super();

        // TODO load the balances

        const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead');

        (async () => {
            // const wbtcTotalSupply = await getWBTCTotalSupply(provider);
            // this.store.wbtcTotalSupply = wbtcTotalSupply.div(10 ** 8);

            // const imbtcTotalSupply = await getIMBTCTotalSupply(provider);
            // this.store.imbtcTotalSupply = imbtcTotalSupply.div(10 ** 8);

            const btcTokensUnsorted: ReadonlyArray<BTCToken> = await Promise.all(this.store.btcTokens.map(async (btcToken: Readonly<BTCToken>) => {
                return {
                    ...btcToken,
                    totalSupply: (await getTotalSupply(btcToken, provider)).div(10 ** btcToken.decimals)
                };
            }));

            const btcTokensSorted = [...btcTokensUnsorted].sort((a, b) => {
                if (a.totalSupply > b.totalSupply) {
                    return 1;
                }

                if (a.totalSupply < b.totalSupply) {
                    return -1;
                }

                return 0;
            });

            this.store.btcTokens = btcTokensSorted;
        })();
    }

    render(state: Readonly<State>) {

        const totalResult: BigNumber | 'Loading...' = state.btcTokens.reduce((result: BigNumber | 'Loading...', btcToken: Readonly<BTCToken>) => {
            if (result === 'Loading...') {
                return result;
            }

            if (btcToken.totalSupply === 'NOT_SET') {
                return 'Loading...';
            }

            return result.plus(btcToken.totalSupply);
        }, new BigNumber(0));

        return html`
            <h1>BTC on Ethereum</h1>

            <br>

            <div>Total: ${totalResult === 'Loading...' ? totalResult : formatBigNumberForDisplay(totalResult)}</div>

            ${state.btcTokens.map((btcToken) => {
                return html`<div>${btcToken.name}: ${btcToken.totalSupply === 'NOT_SET' ? 'Loading...' : formatBigNumberForDisplay(btcToken.totalSupply)}</div>`;
            })}
        `;
    }
}

window.customElements.define('be-app', BEApp);

async function getTotalSupply(btcToken: Readonly<BTCToken>, provider: Readonly<ethers.providers.BaseProvider>): Promise<BigNumber> {
    const contract = new ethers.Contract(btcToken.contractAddress, btcToken.abi, provider);
    return new BigNumber((await contract[btcToken.functionName]()).toString());
}

function formatBigNumberForDisplay(bigNumber: BigNumber): string {
    return bigNumber.toFormat(2, {
        groupSize: 3,
        groupSeparator: ',',
        decimalSeparator: '.'
    });
}