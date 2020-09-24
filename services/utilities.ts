import { ethers } from 'ethers';
import { 
    BTCToken,
    BlockNumberWithTimestamp,
    BTCTokenHistoryItem,
    EthereumLog
} from '../index.d';

export async function fetchLogs(
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