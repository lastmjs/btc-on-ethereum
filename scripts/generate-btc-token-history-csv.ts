// TODO try to pull more of this data from the btc-tokens.ts file...
// TODO make sure to account for sbtc weirdness

import * as fs from 'fs';
import { hbtcHistory } from '../services/hbtc-history';
import { imbtcHistory } from '../services/imbtc-history';
import { pbtcHistory } from '../services/pbtc-history';
import { renbtcHistory } from '../services/renbtc-history';
import { sbtcHistory } from '../services/sbtc-history';
import { tbtcHistory } from '../services/tbtc-history';
import { wbtcHistory } from '../services/wbtc-history';
import { BigNumber } from 'bignumber.js';
import { BTCTokenHistoryItem } from '..';

const mintsAndBurnsCSV: string = generateMintsAndBurnsCSV();

fs.writeFileSync('./mints-and-burns.csv', mintsAndBurnsCSV);

const issuancePerDayCSV: string = generateIssuancePerDayCSV();

fs.writeFileSync('./issuance-per-day.csv', issuancePerDayCSV);

function printDateInUTC(date: Date): string {
    return new Date(new Date(date).getUTCFullYear(), new Date(date).getUTCMonth(), new Date(date).getUTCDate()).toLocaleDateString()
}

function generateMintsAndBurnsCSV(): string {
    const csvColumns = `token,date,amount\n`;

    const hbtcRows = hbtcHistory.reduce((result, item) => {
        return result + `HBTC,${printDateInUTC(new Date(item.timestamp))},${item.amount}\n`;
    }, '');
    
    const imbtcRows = imbtcHistory.reduce((result, item) => {
        return result + `imBTC,${printDateInUTC(new Date(item.timestamp))},${item.amount}\n`;
    }, '');
    
    const pbtcRows = pbtcHistory.reduce((result, item) => {
        return result + `pBTC,${printDateInUTC(new Date(item.timestamp))},${item.amount}\n`;
    }, '');
    
    const renbtcRows = renbtcHistory.reduce((result, item) => {
        return result + `renBTC,${printDateInUTC(new Date(item.timestamp))},${item.amount}\n`;
    }, '');
    
    const sbtcRows = sbtcHistory.reduce((result, item) => {
        return result + `sBTC,${printDateInUTC(new Date(item.timestamp))},${item.amount}\n`;
    }, '');
    
    const tbtcRows = tbtcHistory.reduce((result, item) => {
        return result + `TBTC,${printDateInUTC(new Date(item.timestamp))},${item.amount}\n`;
    }, '');
    
    const wbtcRows = wbtcHistory.reduce((result, item) => {
        return result + `WBTC,${printDateInUTC(new Date(item.timestamp))},${item.amount}\n`;
    }, '');
    
    const csv = `${csvColumns}${hbtcRows}${imbtcRows}${pbtcRows}${renbtcRows}${sbtcRows}${tbtcRows}${wbtcRows}`;
    
    return csv;
}

function generateIssuancePerDayCSV() {
    const csvColumns = `token,date,amount\n`;

    const hbtcRows = getIssuancePerDays(hbtcHistory).reduce((result, item) => {
        return result + `HBTC,${printDateInUTC(item.day)},${item.amount}\n`;
    }, '');
    
    const imbtcRows = getIssuancePerDays(imbtcHistory).reduce((result, item) => {
        return result + `imBTC,${printDateInUTC(item.day)},${item.amount}\n`;
    }, '');
    
    const pbtcRows = getIssuancePerDays(pbtcHistory).reduce((result, item) => {
        return result + `pBTC,${printDateInUTC(item.day)},${item.amount}\n`;
    }, '');
    
    const renbtcRows = getIssuancePerDays(renbtcHistory).reduce((result, item) => {
        return result + `renBTC,${printDateInUTC(item.day)},${item.amount}\n`;
    }, '');
    
    const sbtcRows = getIssuancePerDays(sbtcHistory).reduce((result, item) => {
        return result + `sBTC,${printDateInUTC(item.day)},${item.amount}\n`;
    }, '');
    
    const tbtcRows = getIssuancePerDays(tbtcHistory).reduce((result, item) => {
        return result + `TBTC,${printDateInUTC(item.day)},${item.amount}\n`;
    }, '');
    
    const wbtcRows = getIssuancePerDays(wbtcHistory).reduce((result, item) => {
        return result + `WBTC,${printDateInUTC(item.day)},${item.amount}\n`;
    }, '');
    
    const csv = `${csvColumns}${hbtcRows}${imbtcRows}${pbtcRows}${renbtcRows}${sbtcRows}${tbtcRows}${wbtcRows}`;
    
    return csv;
}

type IssuancePerDay = {
    readonly day: Date;
    readonly amount: string;
};

function getIssuancePerDays(btcTokenHistory: ReadonlyArray<BTCTokenHistoryItem>): ReadonlyArray<IssuancePerDay> {
    return btcTokenHistory.reduce((result, btcTokenHistoryItem: Readonly<BTCTokenHistoryItem>, index: number) => {
        
        if (
            new Date(btcTokenHistoryItem.timestamp).getUTCFullYear() === result.currentIssuancePerDay.day.getUTCFullYear() &&
            new Date(btcTokenHistoryItem.timestamp).getUTCMonth() === result.currentIssuancePerDay.day.getUTCMonth() &&
            new Date(btcTokenHistoryItem.timestamp).getUTCDate() === result.currentIssuancePerDay.day.getUTCDate()
        ) {
            const currentIssuancePerDay: Readonly<IssuancePerDay> = {
                ...result.currentIssuancePerDay,
                amount: new BigNumber(result.currentIssuancePerDay.amount).plus(btcTokenHistoryItem.amount).toString()
            };

            return {
                ...result,
                currentIssuancePerDay,
                issuancePerDays: index === btcTokenHistory.length - 1 ? [...result.issuancePerDays, currentIssuancePerDay] : result.issuancePerDays
            };        
        }
        else {
            const currentIssuancePerDay: Readonly<IssuancePerDay> = {
                day: new Date(btcTokenHistoryItem.timestamp),
                amount: btcTokenHistoryItem.amount
            };

            return {
                ...result,
                currentIssuancePerDay,
                issuancePerDays: index === 0 ? result.issuancePerDays : [...result.issuancePerDays, result.currentIssuancePerDay]
            };
        }
    }, {
        currentIssuancePerDay: {
            day: new Date(0),
            amount: '0'
        },
        issuancePerDays: []
    }).issuancePerDays;
}