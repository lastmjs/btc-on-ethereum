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

// TODO we cannot have any errors in this process. If an error occurs we should retry
// TODO I want to have the confidence that this process is done perfectly or not done
// TODO we should also be careful about going up to the latest block because of potential reorgs
(async () => {
    // const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead', {
    //     quorum: 1 // TODO I would prefer to not set the quorum to 1, but I keep getting quorum not reached errors: https://github.com/ethers-io/ethers.js/issues/841
    // });
    const provider: Readonly<ethers.providers.BaseProvider> = new ethers.providers.JsonRpcProvider('https://blue-young-wave.quiknode.pro/d112df71fbe22ff0cdd7e735142b8bae6dd22041/');
    const latestBlockNumber: number = await provider.getBlockNumber();

    for (let i=0; i < btcTokens.length; i++) {
        const btcToken: Readonly<BTCToken> = btcTokens[i];

        console.log(`Fetching history for ${btcToken.name}`);

        if (fs.existsSync(`./services/${btcToken.name.toLowerCase()}-history.ts`) === false) {
            fs.writeFileSync(`./services/${btcToken.name.toLowerCase()}-history.ts`, `
                import { BTCTokenHistoryItem } from '../index.d';
                export const ${btcToken.name.toLowerCase()}History: ReadonlyArray<BTCTokenHistoryItem> = [];
            `);
        }

        const btcTokenHistoryModule = await import(`../services/${btcToken.name.toLowerCase()}-history.ts`);
        const btcTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = btcTokenHistoryModule[`${btcToken.name.toLowerCase()}History`];
        const lastBTCTokenHistoryItem: Readonly<BTCTokenHistoryItem> | undefined = btcTokenHistoryItems[btcTokenHistoryItems.length - 1];
        const lastBlockNumber: number = lastBTCTokenHistoryItem ? lastBTCTokenHistoryItem.blockNumber : -1;
        const fromBlock: number = lastBlockNumber + 1;

        const mintLogs: ReadonlyArray<EthereumLog> = await fetchLogs(provider, btcToken.contractAddress, btcToken.mintTopics, 'MINT', latestBlockNumber, fromBlock);
        
        console.log('mintLogs', mintLogs);
        
        const burnLogs: ReadonlyArray<EthereumLog> = await fetchLogs(provider, btcToken.contractAddress, btcToken.burnTopics, 'BURN', latestBlockNumber, fromBlock);        
        
        console.log('burnLogs', burnLogs);
        
        const ethereumLogs: ReadonlyArray<EthereumLog> = [...mintLogs, ...burnLogs];
        const sortedEthereumLogs: ReadonlyArray<EthereumLog> = sortEthereumLogs(ethereumLogs);
        console.log('sortedEthereumLogs', sortedEthereumLogs);

        const blockNumbers: ReadonlyArray<number> = getBlockNumbersFromLogs(sortedEthereumLogs);
        console.log('blockNumbers', blockNumbers);
        const blockNumbersWithTimestamps: ReadonlyArray<BlockNumberWithTimestamp> = await getBlockNumbersWithTimestamps(blockNumbers);

        const untrackedBTCTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = createBTCTokenHistoryItems(sortedEthereumLogs, blockNumbersWithTimestamps, btcToken.getAmountFromLog);

        const newBTCTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = [...btcTokenHistoryItems, ...untrackedBTCTokenHistoryItems];

        const serializedNewBTCTokenHistoryItems = JSON.stringify(newBTCTokenHistoryItems);

        fs.writeFileSync(`./services/${btcToken.name.toLowerCase()}-history.ts`, `
            import { BTCTokenHistoryItem } from '../index.d';
            export const ${btcToken.name.toLowerCase()}History: ReadonlyArray<BTCTokenHistoryItem> = ${serializedNewBTCTokenHistoryItems};
        `);

        console.log(`History for ${btcToken.name} fetched\n`);
    }

})();

function getBlockNumbersFromLogs(logs: ReadonlyArray<ethers.providers.Log>): ReadonlyArray<number> {
    const blockNumbers: ReadonlyArray<number> = logs.map((log: Readonly<ethers.providers.Log>) => {
        return log.blockNumber;
    });
    return blockNumbers;
}

async function getBlockNumbersWithTimestamps(
    blockNumbers: ReadonlyArray<number>,
    blockNumbersWithTimestamps: ReadonlyArray<BlockNumberWithTimestamp> = [],
    start: number = 0,
    window: number = 100
): Promise<ReadonlyArray<BlockNumberWithTimestamp>> {

    console.log('getBlockNumbersWithTimestamps');
    console.log('start', start);
    console.log('blockNumbers.length', blockNumbers.length);

    if (start > blockNumbers.length - 1) {
        return blockNumbersWithTimestamps;
    }

    const end: number = start + window > blockNumbers.length ? blockNumbers.length : start + window;

    console.log('end', end);

    const result = await gqlRequest(fetch, `
        query ($blockNumbers: [Int!]) {
            blocks(where: {
                number_in: $blockNumbers
            }, skip: $skip, first: $first) {
                number
                timestamp
            }
        }
    `, {
          blockNumbers: blockNumbers.slice(start, end)
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return await getBlockNumbersWithTimestamps(blockNumbers, [...blockNumbersWithTimestamps, ...result.data.blocks], start + window);
}

function sortEthereumLogs(ethereumLogs: ReadonlyArray<EthereumLog>): ReadonlyArray<EthereumLog> {
    const sortedEthereumLogs: ReadonlyArray<EthereumLog> = [...ethereumLogs].sort((a, b) => {
        if (a.blockNumber > b.blockNumber) {
            return 1;
        }

        if (a.blockNumber < b.blockNumber) {
            return -1;
        }

        return 0;
    });

    return sortedEthereumLogs;
}

function createBTCTokenHistoryItems(
    ethereumLogs: ReadonlyArray<EthereumLog>,
    blockNumbersWithTimestamps: ReadonlyArray<BlockNumberWithTimestamp>,
    getAmountFromLog: (log: Readonly<ethers.providers.Log>) => string
): ReadonlyArray<BTCTokenHistoryItem> {
    return ethereumLogs.map((ethereumLog: Readonly<EthereumLog>) => {

        const blockNumberWithTimestamp: Readonly<BlockNumberWithTimestamp> = blockNumbersWithTimestamps.find((blockNumberWithTimestamp: Readonly<BlockNumberWithTimestamp>) => {
            return ethereumLog.blockNumber.toString() === blockNumberWithTimestamp.number;
        });

        return {
            blockNumber: parseInt(blockNumberWithTimestamp.number),
            timestamp: parseInt(blockNumberWithTimestamp.timestamp) * 1000,
            amount: new BigNumber(getAmountFromLog(ethereumLog)).times(ethereumLog.issuanceType === 'MINT' ? 1 : -1).toString()
        };
    });
}