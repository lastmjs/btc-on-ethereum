import { BigNumber } from 'bignumber.js';
import { ethers } from 'ethers';

export type BTCToken = {
    readonly name: string;
    readonly decimals: number;
    readonly totalSupply: BigNumber | 'NOT_SET';
    readonly usdPrice: BigNumber | 'NOT_SET';
    readonly contractAddress: string;
    readonly abi: Array<string>;
    readonly functionName: string;
    readonly href: string | 'NOT_SET';
};

export type BlockNumbersWithTimestamps = {
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