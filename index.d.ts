import { BigNumber } from 'bignumber.js';
import { ethers } from 'ethers';

export type BTCToken = {
    readonly name: string;
    readonly decimals: number;
    readonly totalSupply: BigNumber | 'NOT_SET';
    readonly initialTotalSupply: string;
    readonly usdPrice: BigNumber | 'NOT_SET';
    readonly contractAddress: string;
    readonly abi: Array<string>;
    readonly functionName: string;
    readonly href: string | 'NOT_SET';
    readonly mintTopics: Array<string | null>;
    readonly burnTopics: Array<string | null>;
    readonly getAmountFromLog: (log: Readonly<ethers.providers.Log>) => string;
};

export type BlockNumberWithTimestamp = {
    readonly number: string;
    readonly timestamp: string;
};

export type BTCTokenHistoryItem = {
    readonly blockNumber: number;
    readonly timestamp: number;
    readonly amount: string;
};

export interface EthereumLog extends ethers.providers.Log {
    readonly issuanceType: 'MINT' | 'BURN';
}