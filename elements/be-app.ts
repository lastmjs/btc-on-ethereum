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
    readonly href: string | 'NOT_SET';
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
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
        },
        {
            name: 'imBTC',
            decimals: 8,
            totalSupply: 'NOT_SET',
            contractAddress: '0x3212b29E33587A00FB1C83346f5dBFA69A458923',
            abi: [
                'function totalSupply() external view returns (uint256)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x3212b29E33587A00FB1C83346f5dBFA69A458923'
        },
        {
            name: 'sBTC',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
            abi: [
                'function totalSupply() public view returns (uint256)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6'
        },
        {
            name: 'pBTC',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x5228a22e72ccC52d415EcFd199F99D0665E7733b',
            abi: [
                'function totalSupply() external view returns (uint256)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x5228a22e72ccc52d415ecfd199f99d0665e7733b'
        }
    ]
};

class BEApp extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    constructor() {
        super();

        const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead');

        (async () => {
            const btcTokensUnsorted: ReadonlyArray<BTCToken> = await Promise.all(this.store.btcTokens.map(async (btcToken: Readonly<BTCToken>) => {
                return {
                    ...btcToken,
                    totalSupply: (await getTotalSupply(btcToken, provider)).div(10 ** btcToken.decimals)
                };
            }));

            const btcTokensSorted: ReadonlyArray<BTCToken> = [...btcTokensUnsorted].sort((a, b) => {

                if (
                    a.totalSupply === 'NOT_SET' ||
                    b.totalSupply === 'NOT_SET'
                ) {
                    return 0;
                }

                if (a.totalSupply.lt(b.totalSupply)) {
                    return 1;
                }

                if (a.totalSupply.gt(b.totalSupply)) {
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
            <style>
                body {
                    background-color: black;
                    font-family: sans-serif;
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                }

                .be-token-main-container {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    padding: calc(50px + 1vmin);
                }

                .be-token-card-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .be-token-card {
                    color: orange;
                    border: solid 5px grey;
                    padding: calc(25px + 1vmin);
                    margin: calc(5px + 1vmin);
                    border-radius: calc(5px + 1vmin);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    text-decoration: none;
                }

                .be-amount-text {
                    color: orange;
                    font-size: calc(50px + 1vmin);
                }

                .be-description-text {
                    color: grey;
                    font-size: calc(25px + 1vmin);
                }
            </style>

            <div class="be-token-main-container">
                <div style="display: flex; justify-content: center">
                    <a class="be-token-card" href="/">
                        <div class="be-amount-text">${totalResult === 'Loading...' ? totalResult : formatBigNumberForDisplay(totalResult)}</div>
                        <div class="be-description-text">Total BTC on Ethereum</div>
                    </a>
                </div>

                <div class="be-token-card-container">
                    ${state.btcTokens.map((btcToken) => {
                        return html`
                            <a class="be-token-card" href="${btcToken.href}" target="_blank">
                                <div class="be-amount-text">${btcToken.totalSupply === 'NOT_SET' ? 'Loading...' : formatBigNumberForDisplay(btcToken.totalSupply)}</div>
                                <div class="be-description-text">${btcToken.name}</div>
                            </a>
                        `;
                    })}
                </div>
            </div>
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