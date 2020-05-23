import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { btcTokens } from '../services/btc-tokens';

type State = {
    readonly showing: string;
};

const InitialState: Readonly<State> = {
    showing: ''
};

class BEDescription extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    render(state: Readonly<State>) {
        return html`
            <style>
                .be-description-main-container {
                    color: white;
                }

                .be-description-token-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .be-description-title {
                    font-size: calc(25px + 1vmin);
                    font-weight: bold;
                }

                .be-description-paragraph {
                    font-size: calc(10px + 1vmin);
                }
            </style>

            <div class="be-description-main-container">
                <div style="${state.showing === 'total' ? '' : 'display: none'}" class="be-description-token-container">
                    <div class="be-description-title">BTC on Ethereum</div>
                    <div style="width: 50%">
                        <p class="be-description-paragraph">
                            Welcome to BTC on Ethereum, a project that attempts to aggregate information about all significant sources of BTC that have been tokenized onto the Ethereum blockchain.
                        </p>
    
                        <p class="be-description-paragraph">
                            BTC can be tokenized on Ethereum in a variety of ways, with various tradeoffs including differing levels of decentralization and trust assumptions.
                        </p>
    
                        <p class="be-description-paragraph">
                            Explore the different BTC tokens by hovering over or clicking on them in the sidebar to the left.
                        </p>
    
                        <p class="be-description-paragraph">
                            If you see any incorrect or missing information, especially missing tokens, please don't hesitate to reach out.
                        </p>
                    </div>
                </div>


                ${btcTokens.map((btcToken) => {
                    return html`
                        <div style="${state.showing === btcToken.name ? '' : 'display: none'}" class="be-description-token-container">
                            ${btcToken.description}
                        </div>
                    `;
                })}
            </div>
        `;
    }
}

window.customElements.define('be-description', BEDescription);