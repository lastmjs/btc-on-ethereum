// TODO we might not need to sort everything, the charts might do it...not sure we shouldn't though
import { btcTokens } from '../services/btc-tokens';
import { ethers } from 'ethers';
import { 
    BTCToken,
    BlockNumbersWithTimestamps,
    BTCTokenHistoryItem,
    EthereumLog
} from '../index.d';
import * as fetch from 'node-fetch';
import { gqlRequest } from '../services/graphql';
import { BigNumber } from 'bignumber.js';
import * as fs from 'fs';

(async () => {
    // const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead');
    const provider: Readonly<ethers.providers.BaseProvider> = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_JSON_RPC_ENDPOINT);
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

        const mintLogs: ReadonlyArray<EthereumLog> = await fetchMintLogs(provider, btcToken.contractAddress, latestBlockNumber, fromBlock);
        const burnLogs: ReadonlyArray<EthereumLog> = await fetchBurnLogs(provider, btcToken.contractAddress, latestBlockNumber, fromBlock);
        const ethereumLogs: ReadonlyArray<EthereumLog> = [...mintLogs, ...burnLogs];

        const blockNumbers: ReadonlyArray<number> = getBlockNumbersFromLogs(ethereumLogs);
        const blockNumbersWithTimestamps: ReadonlyArray<BlockNumbersWithTimestamps> = await getBlockNumbersWithTimestamps(blockNumbers);
        const untrackedBTCTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = createBTCTokenHistoryItems(ethereumLogs, blockNumbersWithTimestamps, btcToken.decimals);

        const newBTCTokenHistoryItems: ReadonlyArray<BTCTokenHistoryItem> = [...btcTokenHistoryItems, ...untrackedBTCTokenHistoryItems];

        const serializedNewBTCTokenHistoryItems = JSON.stringify(newBTCTokenHistoryItems);

        fs.writeFileSync(`./services/${btcToken.name.toLowerCase()}-history.ts`, `
            import { BTCTokenHistoryItem } from '../index.d';
            export const ${btcToken.name.toLowerCase()}History: ReadonlyArray<BTCTokenHistoryItem> = ${serializedNewBTCTokenHistoryItems};
        `);

        console.log(`History for ${btcToken.name} fetched\n`);
    }

})();

async function fetchMintLogs(
    provider: Readonly<ethers.providers.BaseProvider>,
    contractAddress: string,
    latestBlockNumber: number,
    fromBlock: number,
    toBlock: number = 0,
    skip: number = 500000,
    allEthereumLogs: ReadonlyArray<EthereumLog> = []
): Promise<ReadonlyArray<EthereumLog>> {

    console.log('fetchMintLogs');
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
        topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ]
    });

    const someEthereumLogs: ReadonlyArray<EthereumLog> = someLogs.map((log: Readonly<ethers.providers.Log>) => {
        return {
            ...log,
            issuanceType: 'MINT'
        };
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    return await fetchMintLogs(provider, contractAddress, latestBlockNumber, fromBlock + skip, theToBlock + skip + 1, skip, [...allEthereumLogs, ...someEthereumLogs]);
}

async function fetchBurnLogs(
    provider: Readonly<ethers.providers.BaseProvider>,
    contractAddress: string,
    latestBlockNumber: number,
    fromBlock: number,
    toBlock: number = 0,
    skip: number = 500000,
    allEthereumLogs: ReadonlyArray<EthereumLog> = []
): Promise<ReadonlyArray<EthereumLog>> {

    console.log('fetchBurnLogs');
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
        topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            null,
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ]
    });

    const someEthereumLogs: ReadonlyArray<EthereumLog> = someLogs.map((log: Readonly<ethers.providers.Log>) => {
        return {
            ...log,
            issuanceType: 'BURN'
        };
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    return await fetchBurnLogs(provider, contractAddress, latestBlockNumber, fromBlock + skip, theToBlock + skip + 1, skip, [...allEthereumLogs, ...someEthereumLogs]);
}

function getBlockNumbersFromLogs(logs: ReadonlyArray<ethers.providers.Log>): ReadonlyArray<number> {
    const blockNumbers: ReadonlyArray<number> = logs.map((log: Readonly<ethers.providers.Log>) => {
        return log.blockNumber;
    });
    return blockNumbers;
}

async function getBlockNumbersWithTimestamps(blockNumbers: ReadonlyArray<number>): Promise<ReadonlyArray<BlockNumbersWithTimestamps>> {
    const result = await gqlRequest(fetch, `
        query ($blockNumbers: [Int!]) {
            blocks(where: {
                number_in: $blockNumbers
            }) {
                number
                timestamp
            }
        }
  `, {
      blockNumbers
  });

  const unsortedBlockNumbersWithTimestamps: ReadonlyArray<BlockNumbersWithTimestamps> = result.data.blocks;
  const sortedBlockNumbersWithTimestamps: ReadonlyArray<BlockNumbersWithTimestamps> = [...unsortedBlockNumbersWithTimestamps].sort((a, b) => {
        if (a.timestamp > b.timestamp) {
            return 1;
        }

        if (a.timestamp < b.timestamp) {
            return -1;
        }

        return 0;
    });

  return sortedBlockNumbersWithTimestamps;
}

function createBTCTokenHistoryItems(
    ethereumLogs: ReadonlyArray<EthereumLog>,
    blockNumbersWithTimestamps: ReadonlyArray<BlockNumbersWithTimestamps>,
    decimals: number
): ReadonlyArray<BTCTokenHistoryItem> {
    return blockNumbersWithTimestamps.map((blockNumberWithTimestamp: Readonly<BlockNumbersWithTimestamps>) => {

        const ethereumLog: Readonly<EthereumLog> = ethereumLogs.find((ethereumLog: Readonly<EthereumLog>) => {
            return ethereumLog.blockNumber.toString() === blockNumberWithTimestamp.number;
        });

        return {
            blockNumber: parseInt(blockNumberWithTimestamp.number),
            timestamp: parseInt(blockNumberWithTimestamp.timestamp) * 1000,
            amount: new BigNumber(ethereumLog.data).dividedBy(10 ** decimals).times(ethereumLog.issuanceType === 'MINT' ? 1 : -1).toString()
        };
    });
}