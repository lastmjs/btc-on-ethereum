import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { BigNumber } from 'bignumber.js';
import {
    BTCToken, 
    BTCTokenHistoryItem
} from '../index.d';
import { btcTokens } from '../services/btc-tokens';

type State = {};

const InitialState: Readonly<State> = {};

class BECharts extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    connectedCallback() {

        setTimeout(() => {

            this.prepareTotalCanvas();

            btcTokens.forEach(async (btcToken: Readonly<BTCToken>) => {

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
            
                const ctx = this.querySelector(`#${btcToken.name.toLowerCase()}-canvas`);

                const chart = new (window as any).Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: btcToken.name,
                                backgroundColor: '#ffffff',
                                data: amounts
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
            });
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

        console.log('sortedTotalBTCTokenHistoryItems', sortedTotalBTCTokenHistoryItems);

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
                        data: amounts
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
            <div style="width: 100%; height: 100%">
                <canvas id="total-canvas"></canvas>
                ${btcTokens.map((btcToken: Readonly<BTCToken>) => {
                    return html`<canvas id="${btcToken.name.toLowerCase()}-canvas"></canvas>`;
                })}
            </div>
        `;
    }
}

window.customElements.define('be-charts', BECharts);