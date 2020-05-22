import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { BigNumber } from 'bignumber.js';
import {
    BTCToken, 
    BTCTokenHistoryItem
} from '../index.d';
import { btcTokens } from '../services/btc-tokens';
import './be-chart';

type State = {
    readonly showing: string;
    readonly btcTokenChartInfos: ReadonlyArray<{
        readonly name: string;
        readonly dates: ReadonlyArray<string>;
        readonly amounts: ReadonlyArray<number>
    }>
};

const InitialState: Readonly<State> = {
    btcTokenChartInfos: [],
    showing: ''
};

class BECharts extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    connectedCallback() {

        setTimeout(async () => {

            this.prepareTotalCanvas();

            this.store.btcTokenChartInfos = await Promise.all(btcTokens.map(async (btcToken: Readonly<BTCToken>) => {

                const btcTokenHistoryModule = await import(`../services/${btcToken.name.toLowerCase()}-history.ts`);
                const btcTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = btcTokenHistoryModule[`${btcToken.name.toLowerCase()}History`];        

                const dates: ReadonlyArray<string> = btcTokenHistoryItems.map((btcHistoryItem: Readonly<BTCTokenHistoryItem>) => {
                    return new Date(btcHistoryItem.timestamp).toISOString();
                });
            
                const amounts: ReadonlyArray<number> = btcTokenHistoryItems.reduce((result, btcHistoryItem: Readonly<BTCTokenHistoryItem>) => {
    
                    const newSum = result.sum.plus(btcHistoryItem.amount);
    
                    return {
                        ...result,
                        sum: newSum,
                        items: [...result.items, newSum]
                    };
                }, {
                    sum: new BigNumber(btcToken.initialTotalSupply), // TODO this should be the token initial total supply
                    items: []
                }).items.map((item) => parseFloat(item.dividedBy(10 ** btcToken.decimals)));
            
                return {
                    name: btcToken.name.toLowerCase(),
                    dates,
                    amounts
                };
            }));
        });
    }

    async prepareTotalCanvas() {

        const totalBTCTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = await btcTokens.reduce(async (result, btcToken) => {
            const btcTokenHistoryModule = await import(`../services/${btcToken.name.toLowerCase()}-history.ts`);
            const btcTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = btcTokenHistoryModule[`${btcToken.name.toLowerCase()}History`];        

            const btcTokenHistoryItemsAmountsInDecimal: ReadonlyArray<BTCTokenHistoryItem> = btcTokenHistoryItems.map((btcTokenHistoryItem, index) => {
                return {
                    ...btcTokenHistoryItem,
                    amount: (new BigNumber(btcTokenHistoryItem.amount).plus(index === 0 ? btcToken.initialTotalSupply : 0)).dividedBy(10 ** btcToken.decimals).toString()
                };
            });

            return [...(await result), ...btcTokenHistoryItemsAmountsInDecimal];
        }, Promise.resolve([]));

        const sortedTotalBTCTokenHistoryItems = [...totalBTCTokenHistoryItems].sort((a, b) => {
            if (a.timestamp > b.timestamp) {
                return 1;
            }

            if (a.timestamp < b.timestamp) {
                return -1;
            }

            return 0;
        });

        const dates: ReadonlyArray<string> = sortedTotalBTCTokenHistoryItems.map((btcHistoryItem: Readonly<BTCTokenHistoryItem>) => {
            return new Date(btcHistoryItem.timestamp).toISOString();
        });
    
        const amounts: ReadonlyArray<number> = sortedTotalBTCTokenHistoryItems.reduce((result, btcHistoryItem: Readonly<BTCTokenHistoryItem>) => {

            const newSum = result.sum.plus(btcHistoryItem.amount);

            return {
                ...result,
                sum: newSum,
                items: [...result.items, newSum]
            };
        }, {
            sum: new BigNumber(0),
            items: []
        }).items;

        const ctx = this.querySelector(`#total-canvas`);

        const chart = new (window as any).Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Total BTC on Ethereum',
                        backgroundColor: '#ffffff',
                        data: amounts,
                        pointHitRadius: 10,
                        // borderWidth: 10
                        // steppedLine: true
                    }
                ]
            },
            options: {
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            gridLines: {
                                // display: true,
                                // color: 'grey'
                            },
                            time: {
                                minUnit: 'month'
                            }
                        }
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                color: 'rgba(255, 255, 255, .1)'
                            }
                        }
                    ]
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }

    render(state: Readonly<State>) {
        return html`
            <div>
                <div ?hidden=${state.showing !== 'total'}>
                    <canvas id="total-canvas"></canvas>
                </div>
                
                ${state.btcTokenChartInfos.map((btcTokenChartInfo) => {
                    return html`
                        <div ?hidden=${state.showing !== btcTokenChartInfo.name}>
                            <be-chart .name=${btcTokenChartInfo.name} .dates=${btcTokenChartInfo.dates} .amounts=${btcTokenChartInfo.amounts}></be-chart>
                        </div>
                    `;
                })}
            </div>
        `;
    }
}

window.customElements.define('be-charts', BECharts);