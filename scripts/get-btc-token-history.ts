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
    const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead', {
        quorum: 1 // TODO I would prefer to not set the quorum to 1, but I keep getting quorum not reached errors: https://github.com/ethers-io/ethers.js/issues/841
    });
    // const provider: Readonly<ethers.providers.BaseProvider> = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_JSON_RPC_ENDPOINT);
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

async function fetchLogs(
    provider: Readonly<ethers.providers.BaseProvider>,
    contractAddress: string,
    topics: Array<string | null>,
    mintOrBurn: 'MINT' | 'BURN',
    latestBlockNumber: number,
    fromBlock: number,
    toBlock: number = 0,
    skip: number = 1000000,
    allEthereumLogs: ReadonlyArray<EthereumLog> = []
): Promise<ReadonlyArray<EthereumLog>> {

    console.log(`fetchLogs: ${mintOrBurn}`);
    console.log('fromBlock', fromBlock);
    console.log('toBlock', toBlock);

    if (fromBlock > latestBlockNumber) {
        return allEthereumLogs;
    }

    const theToBlock = toBlock === 0 ? fromBlock + skip - 1 : toBlock - 1;
    const theActualToBlock = theToBlock > latestBlockNumber ? latestBlockNumber : theToBlock;

    console.log('theToBlock', theToBlock);
    console.log('theActualToBlock', theActualToBlock);

    const someLogs: ReadonlyArray<ethers.providers.Log> = await provider.getLogs({
        fromBlock,
        toBlock: theActualToBlock,
        address: contractAddress,
        topics
    });

    const someEthereumLogs: ReadonlyArray<EthereumLog> = someLogs.map((log: Readonly<ethers.providers.Log>) => {
        return {
            ...log,
            issuanceType: mintOrBurn
        };
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return await fetchLogs(provider, contractAddress, topics, mintOrBurn, latestBlockNumber, fromBlock + skip, theToBlock + skip + 1, skip, [...allEthereumLogs, ...someEthereumLogs]);
}

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