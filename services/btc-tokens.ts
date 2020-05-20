import { BTCToken } from '../index.d';

export const btcTokens: ReadonlyArray<BTCToken> = [
    {
        name: 'WBTC',
        decimals: 8,
        totalSupply: 'NOT_SET',
        usdPrice: 'NOT_SET',
        contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        abi: [
            'function totalSupply() public view returns (uint256)'   
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
    },
    {
        name: 'imBTC',
        decimals: 8,
        totalSupply: 'NOT_SET',
        usdPrice: 'NOT_SET',
        contractAddress: '0x3212b29E33587A00FB1C83346f5dBFA69A458923',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x3212b29E33587A00FB1C83346f5dBFA69A458923'
    },
    {
        name: 'sBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        usdPrice: 'NOT_SET',
        contractAddress: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
        abi: [
            'function totalSupply() public view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6'
    },
    {
        name: 'pBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        usdPrice: 'NOT_SET',
        contractAddress: '0x5228a22e72ccC52d415EcFd199F99D0665E7733b',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x5228a22e72ccc52d415ecfd199f99d0665e7733b'
    },
    {
        name: 'TBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        usdPrice: 'NOT_SET',
        contractAddress: '0x1bBE271d15Bb64dF0bc6CD28Df9Ff322F2eBD847',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x1bBE271d15Bb64dF0bc6CD28Df9Ff322F2eBD847'
    },
    {
        name: 'HBTC',
        decimals: 18,
        totalSupply: 'NOT_SET',
        usdPrice: 'NOT_SET',
        contractAddress: '0x0316EB71485b0Ab14103307bf65a021042c6d380',
        abi: [
            'function totalSupply() public view returns (uint256 supply)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0x0316EB71485b0Ab14103307bf65a021042c6d380'
    },
    {
        name: 'renBTC',
        decimals: 8,
        totalSupply: 'NOT_SET',
        usdPrice: 'NOT_SET',
        contractAddress: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
        abi: [
            'function totalSupply() external view returns (uint256)'
        ],
        functionName: 'totalSupply',
        href: 'https://etherscan.io/token/0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D'
    }
];