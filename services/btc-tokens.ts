import { BTCToken } from '../index.d';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

export const btcTokens: ReadonlyArray<BTCToken> = [
    {
        name: 'WBTC',
        decimals: 8,
        totalSupply: 'NOT_SET',
        initialTotalSupply: '0',
        usdPrice: 'NOT_SET',
        contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        abi: [
            'function totalSupply() public view returns (uint256)'   
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        mintTopics: [
            '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885'
        ],
        burnTopics: [
            '0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5'
        ],
        getAmountFromLog: (log: Readonly<ethers.providers.Log>) => {
            return new BigNumber(log.data).toString();
        }
    },
    {
        name: 'imBTC',
        decimals: 8,
        totalSupply: 'NOT_SET',
        initialTotalSupply: '0',
        usdPrice: 'NOT_SET',
        contractAddress: '0x3212b29E33587A00FB1C83346f5dBFA69A458923',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x3212b29E33587A00FB1C83346f5dBFA69A458923',
        mintTopics: [
            '0x2fe5be0146f74c5bce36c0b80911af6c7d86ff27e89d5cfa61fc681327954e5d'
        ],
        burnTopics: [
            '0xa78a9be3a7b862d26933ad85fb11d80ef66b8f972d7cbba06621d583943a4098'
        ],
        getAmountFromLog: (log: Readonly<ethers.providers.Log>) => {
            return new BigNumber(log.data.slice(0, 66)).toString();
        }
    },
    {
        name: 'sBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        initialTotalSupply: '69994085605939743585',
        usdPrice: 'NOT_SET',
        contractAddress: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
        abi: [
            'function totalSupply() public view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
        mintTopics: [
            '0xa59f12e354e8cd10bb74c559844c2dd69a5458e31fe56c7594c62ca57480509a'
        ],
        burnTopics: [
            '0x696de425f79f4a40bc6d2122ca50507f0efbeabbff86a84871b7196ab8ea8df7'
        ],
        getAmountFromLog: (log: Readonly<ethers.providers.Log>) => {
            return new BigNumber(log.data.slice(0, 66)).toString();
        }
    },
    {
        name: 'pBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        initialTotalSupply: '0',
        usdPrice: 'NOT_SET',
        contractAddress: '0x5228a22e72ccC52d415EcFd199F99D0665E7733b',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x5228a22e72ccc52d415ecfd199f99d0665e7733b',
        mintTopics: [
            '0x2fe5be0146f74c5bce36c0b80911af6c7d86ff27e89d5cfa61fc681327954e5d'
        ],
        burnTopics: [
            '0xa78a9be3a7b862d26933ad85fb11d80ef66b8f972d7cbba06621d583943a4098'
        ],
        getAmountFromLog: (log: Readonly<ethers.providers.Log>) => {
            return new BigNumber(log.data.slice(0, 66)).toString();
        }
    },
    {
        name: 'TBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        initialTotalSupply: '0',
        usdPrice: 'NOT_SET',
        contractAddress: '0x1bBE271d15Bb64dF0bc6CD28Df9Ff322F2eBD847',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x1bBE271d15Bb64dF0bc6CD28Df9Ff322F2eBD847',
        mintTopics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ],
        burnTopics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            null,
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ],
        getAmountFromLog: (log: Readonly<ethers.providers.Log>) => {
            return new BigNumber(log.data).toString();
        }
    },
    {
        name: 'HBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        initialTotalSupply: '0',
        usdPrice: 'NOT_SET',
        contractAddress: '0x0316EB71485b0Ab14103307bf65a021042c6d380',
        abi: [
            'function totalSupply() public view returns (uint256 supply)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x0316EB71485b0Ab14103307bf65a021042c6d380',
        mintTopics: [
            '0xe7cd4ce7f2a465edc730269a1305e8a48bad821e8fb7e152ec413829c01a53c4'
        ],
        burnTopics: [
            '0xe7fe72e51b458dcd29475a3be9675669af7aa5c3d7e9161fdb6cbba71803dd50'
        ],
        getAmountFromLog: (log: Readonly<ethers.providers.Log>) => {
            return new BigNumber(log.data.slice(0, 66)).toString();
        }
    },
    {
        name: 'renBTC',
        decimals: 8,
        totalSupply: 'NOT_SET',
        initialTotalSupply: '0',
        usdPrice: 'NOT_SET',
        contractAddress: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
        mintTopics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ],
        burnTopics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            null,
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ],
        getAmountFromLog: (log: Readonly<ethers.providers.Log>) => {
            return new BigNumber(log.data).toString();
        }
    }
];