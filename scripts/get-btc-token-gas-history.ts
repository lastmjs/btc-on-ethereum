import { btcTokens } from '../services/btc-tokens';
import { ethers } from 'ethers';
import { 
    BTCToken,
    BlockNumberWithTimestamp,
    BTCTokenHistoryItem,
    EthereumLog
} from '../index.d';
import * as fetch from 'node-fetch';
import { gqlRequest } from '../services/graphql';
import { BigNumber } from 'bignumber.js';
import * as fs from 'fs';

(async () => {
    const provider: Readonly<ethers.providers.BaseProvider> = new ethers.providers.JsonRpcProvider('https://blue-young-wave.quiknode.pro/d112df71fbe22ff0cdd7e735142b8bae6dd22041/');
    
    // TODO should I subtract a few blocks to protect against reorgs?
    const latestBlockNumber: number = await provider.getBlockNumber();

    for (let i=0; i < btcTokens.length; i++) {
        const btcToken: Readonly<BTCToken> = btcTokens[i];

        console.log(`Fetching gas history for ${btcToken.name}`);

        // TODO we need to modify the fetch logs function to allow fetching for mints, burns, and transfers
        // TODO actually, I think we want to look for transactions and not logs...I think
    }
})();