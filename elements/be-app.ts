import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import {
    BTCToken
} from '../index.d';
import { btcTokens } from '../services/btc-tokens';
import './be-charts';
import './be-description';

type State = {
    readonly btcTokens: ReadonlyArray<BTCToken>;
    readonly btcPriceInUSD: BigNumber | 'NOT_SET';
    readonly showingChartName: string;
};

const InitialState: Readonly<State> = {
    btcPriceInUSD: 'NOT_SET',
    btcTokens,
    showingChartName: 'total'
};

class BEApp extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    constructor() {
        super();

        const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead');

        (async () => {

            const btcPriceInUSD: BigNumber = await getBTCPriceInUSD(provider);

            this.store.btcPriceInUSD = btcPriceInUSD.div(10 ** 8);

            const btcTokensUnsorted: ReadonlyArray<BTCToken> = await Promise.all(this.store.btcTokens.map(async (btcToken: Readonly<BTCToken>) => {

                const totalSupply: BigNumber = (await getTotalSupply(btcToken, provider)).div(10 ** btcToken.decimals);

                return {
                    ...btcToken,
                    totalSupply,
                    usdPrice: totalSupply.multipliedBy(this.store.btcPriceInUSD)
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
                    overflow: hidden;
                }

                .be-app-main-container {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    padding-top: calc(50px + 1vmin);
                    padding-right: calc(50px + 1vmin);
                    padding-left: calc(50px + 1vmin);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                @media (max-width: 1280px) {
                    .be-app-main-container {
                        overflow-y: scroll;
                    }
                }

                .be-app-tokens-and-charts-container {
                    display: flex;
                    overflow: hidden;
                    flex-direction: row-reverse;
                }

                @media (max-width: 1280px) {
                    .be-app-tokens-and-charts-container {
                        flex-direction: column;
                        overflow-y: scroll;
                    }
                }

                .be-app-token-card-container {
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    min-height: 100%;
                    justify-content: flex-start;
                    flex-shrink: 0;
                }

                @media (max-width: 1280px) {
                    .be-app-token-card-container {
                        flex-grow: 1;
                    }
                }

                .be-app-token-card {
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
                    flex-shrink: 0;
                }

                .be-app-amount-btc-text {
                    color: orange;
                    font-size: calc(50px + 1vmin);
                }

                .be-app-amount-usd-text {
                    color: green;
                    font-size: calc(30px + 1vmin);
                }

                .be-app-description-text {
                    color: grey;
                    font-size: calc(25px + 1vmin);
                    text-align: center;
                }

                .be-app-chart-and-info-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    align-items: center;
                    flex-shrink: 0;
                }

                @media (max-width: 1280px) {
                    .be-app-chart-and-info-container {
                        height: 75%;
                        overflow-y: scroll;
                    }
                }

                .be-app-charts-container {
                    width: 75%;
                }

                @media (max-width: 1280px) {
                    .be-app-charts-container {
                        width: 100%;
                        flex-grow: 1;
                    }
                }

                .be-app-description-container {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow-y: scroll;
                    box-sizing: border-box;
                    padding: calc(25px + 1vmin);
                }

                @media (max-width: 1280px) {
                    .be-app-description-container {
                        overflow-y: unset;
                        flex-grow: 1;
                    }
                }

                .be-app-extra-info {
                    color: grey;
                    display: flex;
                    justify-content: center;
                    font-size: calc(5px + 1vmin);
                    box-sizing: border-box;
                    padding: calc(10px + 1vmin);
                }

                .be-app-extra-info-item {
                    flex: 1;
                    text-align: center;
                }

                .be-app-ethereum-logo {
                    position: fixed;
                    opacity: .25;
                    left: 25px;
                    top: 25px;
                }

                .be-app-bitcoin-logo {
                    position: fixed;
                    opacity: .25;
                    right: 25px;
                    bottom: 25px;
                    pointer-events: none;
                }

                .be-app-logo-height {
                    max-height: 10vh;
                }
            </style>

            <div class="be-app-bitcoin-logo">
                <img src="bitcoin.png" class="be-app-logo-height">
            </div>

            <div class="be-app-ethereum-logo">
                <img src="ethereum.png" class="be-app-logo-height">
            </div>

            <div class="be-app-main-container">

                <div class="be-app-tokens-and-charts-container">
                
                    <div class="be-app-chart-and-info-container">
                        <div class="be-app-charts-container">
                            <be-charts .showing=${state.showingChartName}></be-charts>
                        </div>
                        <div class="be-app-description-container">
                            <be-description .showing=${state.showingChartName}></be-description>
                        </div>
                    </div>

                    <div class="be-app-token-card-container">
                        <div class="be-app-token-card" @click=${() => this.store.showingChartName = 'total'} @mouseover=${() => this.store.showingChartName = 'total'}>
                            <div class="be-app-amount-btc-text">${totalResult === 'Loading...' ? totalResult : formatBigNumberBTCForDisplay(totalResult)}</div>
                            <div class="be-app-amount-usd-text">${totalResult === 'Loading...' ? 'Loading...' : formatBigNumberUSDForDisplay(totalResult.multipliedBy(state.btcPriceInUSD))}</div>
                            <div class="be-app-description-text">Total BTC on Ethereum</div>
                        </div>
                        ${state.btcTokens.map((btcToken: Readonly<BTCToken>) => {
                            return html`
                                <div class="be-app-token-card" @click=${() => this.store.showingChartName = btcToken.name} @mouseover=${() => this.store.showingChartName = btcToken.name}>
                                    <div class="be-app-amount-btc-text">${btcToken.totalSupply === 'NOT_SET' ? 'Loading...' : formatBigNumberBTCForDisplay(btcToken.totalSupply)}</div>
                                    <div class="be-app-amount-usd-text">${btcToken.usdPrice === 'NOT_SET' ? 'Loading...' : formatBigNumberUSDForDisplay(btcToken.usdPrice)}</div>
                                    <div class="be-app-description-text">${btcToken.name}</div>
                                    <br>
                                    <a href="${btcToken.href}" target="_blank">More info</a>
                                </div>
                            `;
                        })}
                    </div>
                </div>

                <div class="be-app-extra-info">
                    <div class="be-app-extra-info-item">Donations: 0x1139c4Fbc7F8AC3eE07a280af1c4C62cc04f7Df6</div>
                    <div class="be-app-extra-info-item">See also <a href="https://usdonethereum.com" target="_blank">USD on Ethereum</a></div>
                    <div class="be-app-extra-info-item">Feedback (especially any missed tokens): <a href="https://twitter.com/lastmjs" target="_blank">Twitter</a>, <a href="https://t.me/lastmjs" target="_blank">Telegram</a>, <a href="mailto:jordan.michael.last@gmail.com">Email</a></div>
                    <div class="be-app-extra-info-item"><a href="privacy.html">Privacy</a></div>
                    <div class="be-app-extra-info-item"><a href="oss-attribution/attribution.txt">Open Source</a></div>
                </div>
            </div>
        `;
    }
}

window.customElements.define('be-app', BEApp);

async function getTotalSupply(btcToken: Readonly<BTCToken>, provider: Readonly<ethers.providers.BaseProvider>): Promise<BigNumber> {
    const contract = new ethers.Contract(btcToken.contractAddress, btcToken.abi, provider);
    return new BigNumber((await contract[btcToken.functionName]({ blockTag: 10 })).toString());
}

async function getBTCPriceInUSD(provider: Readonly<ethers.providers.BaseProvider>): Promise<BigNumber> {

    const chainlinkBTCUSDContractAddress = '0xF5fff180082d6017036B771bA883025c654BC935';

    const chainlinkBTCUSDContractABI = [
        'function latestAnswer() external view returns (int256)'
    ];

    const chainlinkBTCUSDContract = new ethers.Contract(chainlinkBTCUSDContractAddress, chainlinkBTCUSDContractABI, provider);
    return new BigNumber((await chainlinkBTCUSDContract.latestAnswer()).toString());
}

function formatBigNumberBTCForDisplay(bigNumber: BigNumber): string {
    return bigNumber.toFormat(2, {
        groupSize: 3,
        groupSeparator: ',',
        decimalSeparator: '.'
    });
}

function formatBigNumberUSDForDisplay(bigNumber: BigNumber): string {
    return bigNumber.toFormat(2, {
        groupSize: 3,
        groupSeparator: ',',
        decimalSeparator: '.',
        prefix: '$'
    });
}