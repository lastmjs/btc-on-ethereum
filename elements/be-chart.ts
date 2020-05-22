import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';

type State = {
    readonly name: string;
    readonly dates: ReadonlyArray<string>;
    readonly amounts: ReadonlyArray<number>;
};

const InitialState: Readonly<State> = {
    name: '',
    dates: [],
    amounts: []
};

class BEChart extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    set dates(dates: ReadonlyArray<string>) {

        if (dates === this.store.dates) {
            return;
        }

        this.store.dates = dates;
        this.prepareChart();
    }

    get dates() {
        return this.store.dates;
    }

    set amounts(amounts: ReadonlyArray<number>) {
        
        if (amounts === this.store.amounts) {
            return;
        }
        
        this.store.amounts = amounts;
        this.prepareChart();
    }

    get amounts() {
        return this.store.amounts;
    }

    prepareChart() {

        const ctx = this.querySelector(`canvas`);

        const chart = new (window as any).Chart(ctx, {
            type: 'line',
            data: {
                labels: this.store.dates,
                datasets: [
                    {
                        label: this.store.name,
                        backgroundColor: '#ffffff',
                        data: this.store.amounts,
                        pointHitRadius: 10
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
                <canvas></canvas>
            </div>
        `;
    }
}

window.customElements.define('be-chart', BEChart);