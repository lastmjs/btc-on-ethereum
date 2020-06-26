// TODO try to pull more of this data from the btc-tokens.ts file...

import * as fs from 'fs';
import { hbtcHistory } from '../services/hbtc-history';
import { imbtcHistory } from '../services/imbtc-history';
import { pbtcHistory } from '../services/pbtc-history';
import { renbtcHistory } from '../services/renbtc-history';
import { sbtcHistory } from '../services/sbtc-history';
import { tbtcHistory } from '../services/tbtc-history';
import { wbtcHistory } from '../services/wbtc-history';

const csvColumns = `token,date,decimals,amount\n`;

const hbtcRows = hbtcHistory.reduce((result, item) => {
    return result + `HBTC,${new Date(item.timestamp).toISOString()},18,${item.amount}\n`;
}, '');

const imbtcRows = imbtcHistory.reduce((result, item) => {
    return result + `imBTC,${new Date(item.timestamp).toISOString()},8,${item.amount}\n`;
}, '');

const pbtcRows = pbtcHistory.reduce((result, item) => {
    return result + `pBTC,${new Date(item.timestamp).toISOString()},18,${item.amount}\n`;
}, '');

const renbtcRows = renbtcHistory.reduce((result, item) => {
    return result + `pBTC,${new Date(item.timestamp).toISOString()},8,${item.amount}\n`;
}, '');

const sbtcRows = sbtcHistory.reduce((result, item) => {
    return result + `renBTC,${new Date(item.timestamp).toISOString()},18,${item.amount}\n`;
}, '');

const tbtcRows = tbtcHistory.reduce((result, item) => {
    return result + `TBTC,${new Date(item.timestamp).toISOString()},18,${item.amount}\n`;
}, '');

const wbtcRows = wbtcHistory.reduce((result, item) => {
    return result + `WBTC,${new Date(item.timestamp).toISOString()},8,${item.amount}\n`;
}, '');

const csv = `${csvColumns}${hbtcRows}${imbtcRows}${pbtcRows}${renbtcRows}${sbtcRows}${tbtcRows}${wbtcRows}`;

fs.writeFileSync('./btc-tokens.csv', csv);