import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { wbtcHistory } from '../services/wbtc-history';
import { imbtcHistory } from '../services/imbtc-history';
import { sbtcHistory } from '../services/sbtc-history';
import { pbtcHistory } from '../services/pbtc-history';
import { tbtcHistory } from '../services/tbtc-history';
import { hbtcHistory } from '../services/hbtc-history';
import {
    BTCToken
} from '../index.d';
import { btcTokens } from '../services/btc-tokens';

type State = {
    readonly btcTokens: ReadonlyArray<BTCToken>;
    readonly btcPriceInUSD: BigNumber | 'NOT_SET';
};

const InitialState: Readonly<State> = {
    btcPriceInUSD: 'NOT_SET',
    btcTokens
};

class BEApp extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    constructor() {
        super();

        const wbtcSum = wbtcHistory.reduce((result, historyItem) => {

            // if (historyItem.amount.includes('-')) {
            //     return result;
            // }

            return result.plus(historyItem.amount);
        }, new BigNumber(0));

        console.log('wbtcSum', wbtcSum.toString());

        const imbtcSum = imbtcHistory.reduce((result, historyItem) => {

            // if (historyItem.amount.includes('-')) {
            //     return result;
            // }

            return result.plus(historyItem.amount);
        }, new BigNumber(0));

        console.log('imbtcSum', imbtcSum.toString());

        const sbtcSum = sbtcHistory.reduce((result, historyItem) => {

            // if (historyItem.amount.includes('-')) {
            //     return result;
            // }

            return result.plus(historyItem.amount);
        }, new BigNumber(0));

        console.log('sbtcSum', sbtcSum.toString());

        const pbtcSum = pbtcHistory.reduce((result, historyItem) => {

            // if (historyItem.amount.includes('-')) {
            //     return result;
            // }

            return result.plus(historyItem.amount);
        }, new BigNumber(0));

        console.log('pbtcSum', pbtcSum.toString());

        const tbtcSum = tbtcHistory.reduce((result, historyItem) => {

            // if (historyItem.amount.includes('-')) {
            //     return result;
            // }

            return result.plus(historyItem.amount);
        }, new BigNumber(0));

        console.log('tbtcSum', tbtcSum.toString());

        const hbtcSum = hbtcHistory.reduce((result, historyItem) => {

            // if (historyItem.amount.includes('-')) {
            //     return result;
            // }

            return result.plus(historyItem.amount);
        }, new BigNumber(0));

        console.log('hbtcSum', hbtcSum.toString());

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
                }

                .be-token-main-container {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    padding: calc(50px + 1vmin);
                    overflow-y: scroll;
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

                .be-amount-btc-text {
                    color: orange;
                    font-size: calc(50px + 1vmin);
                }

                .be-amount-usd-text {
                    color: green;
                    font-size: calc(30px + 1vmin);
                }

                .be-description-text {
                    color: grey;
                    font-size: calc(25px + 1vmin);
                }
            </style>

            <div style="position: fixed; opacity: .25; right: 25px; bottom: 25px">
                <img src="bitcoin.png" style="max-height: 10vh">
            </div>

            <div style="position: fixed; opacity: .25; left: 25px; top: 25px">
                <img src="ethereum.png" style="max-height: 10vh">
            </div>

            <div class="be-token-main-container">
                <div style="display: flex; justify-content: center">
                    <a class="be-token-card" href="/">
                        <div class="be-amount-btc-text">${totalResult === 'Loading...' ? totalResult : formatBigNumberBTCForDisplay(totalResult)}</div>
                        <div class="be-amount-usd-text">${totalResult === 'Loading...' ? 'Loading...' : formatBigNumberUSDForDisplay(totalResult.multipliedBy(state.btcPriceInUSD))}</div>
                        <div class="be-description-text">Total BTC on Ethereum</div>
                    </a>
                </div>

                <div style="color: white; display: flex; justify-content: center; font-size: calc(25px + 1vmin)">Historical data (charts) coming soon!</div>

                <div class="be-token-card-container">
                    ${state.btcTokens.map((btcToken: Readonly<BTCToken>) => {
                        return html`
                            <a class="be-token-card" href="${btcToken.href}" target="_blank">
                                <div class="be-amount-btc-text">${btcToken.totalSupply === 'NOT_SET' ? 'Loading...' : formatBigNumberBTCForDisplay(btcToken.totalSupply)}</div>
                                <div class="be-amount-usd-text">${btcToken.usdPrice === 'NOT_SET' ? 'Loading...' : formatBigNumberUSDForDisplay(btcToken.usdPrice)}</div>
                                <div class="be-description-text">${btcToken.name}</div>
                            </a>
                        `;
                    })}
                </div>

                <div style="color: grey; display: flex; flex-direction: column; align-items: center; font-size: calc(10px + 1vmin); margin-top: calc(50px + 1vmin);">
                    <div>Donations: 0x1139c4Fbc7F8AC3eE07a280af1c4C62cc04f7Df6</div>
                    <div>See also <a href="https://usdonethereum.com" target="_blank">USD on Ethereum</a></div>
                    <div>Feedback (especially any missed tokens): <a href="https://twitter.com/lastmjs" target="_blank">Twitter</a>, <a href="https://t.me/lastmjs" target="_blank">Telegram</a>, <a href="mailto:jordan.michael.last@gmail.com">Email</a></div>
                    <div><a href="privacy.html">Privacy</a></div>
                    <div><a href="oss-attribution/attribution.txt">Open Source</a></div>
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