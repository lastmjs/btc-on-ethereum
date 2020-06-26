// TODO try to pull more of this data from the btc-tokens.ts file...

import * as fs from 'fs';
import { hbtcHistory } from '../services/hbtc-history';
import { imbtcHistory } from '../services/imbtc-history';
import { pbtcHistory } from '../services/pbtc-history';
import { renbtcHistory } from '../services/renbtc-history';
import { sbtcHistory } from '../services/sbtc-history';
import { tbtcHistory } from '../services/tbtc-history';
import { wbtcHistory } from '../services/wbtc-history';
import { BigNumber } from 'bignumber.js';

const csvColumns = `token,date,amount\n`;

const hbtcRows = hbtcHistory.reduce((result, item) => {
    return result + `HBTC,${printDateInUTC(new Date(item.timestamp))},${new BigNumber(item.amount).dividedBy(10**18)}\n`;
}, '');

const imbtcRows = imbtcHistory.reduce((result, item) => {
    return result + `imBTC,${printDateInUTC(new Date(item.timestamp))},${new BigNumber(item.amount).dividedBy(10**8)}\n`;
}, '');

const pbtcRows = pbtcHistory.reduce((result, item) => {
    return result + `pBTC,${printDateInUTC(new Date(item.timestamp))},${new BigNumber(item.amount).dividedBy(10**18)}\n`;
}, '');

const renbtcRows = renbtcHistory.reduce((result, item) => {
    return result + `pBTC,${printDateInUTC(new Date(item.timestamp))},${new BigNumber(item.amount).dividedBy(10**8)}\n`;
}, '');

const sbtcRows = sbtcHistory.reduce((result, item) => {
    return result + `renBTC,${printDateInUTC(new Date(item.timestamp))},${new BigNumber(item.amount).dividedBy(10**18)}\n`;
}, '');

const tbtcRows = tbtcHistory.reduce((result, item) => {
    return result + `TBTC,${printDateInUTC(new Date(item.timestamp))},${new BigNumber(item.amount).dividedBy(10**18)}\n`;
}, '');

const wbtcRows = wbtcHistory.reduce((result, item) => {
    return result + `WBTC,${printDateInUTC(new Date(item.timestamp))},${new BigNumber(item.amount).dividedBy(10**8)}\n`;
}, '');

const csv = `${csvColumns}${hbtcRows}${imbtcRows}${pbtcRows}${renbtcRows}${sbtcRows}${tbtcRows}${wbtcRows}`;

fs.writeFileSync('./btc-tokens.csv', csv);

function printDateInUTC(date: Date): string {
    return new Date(new Date(date).getUTCFullYear(), new Date(date).getUTCMonth(), new Date(date).getUTCDate()).toLocaleDateString()
}