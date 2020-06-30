import * as fs from 'fs';
import BigNumber from 'bignumber.js';

type IssuancePerDayRow = {
    readonly token: string;
    readonly date: string;
    readonly amount: string;
};

const issuancePerDayCSV: string = fs.readFileSync('./issuance-per-day.csv').toString();

const hbtcIssuancePerDayTotal = getCSVTotal('HBTC', 18, issuancePerDayCSV);
const imbtcIssuancePerDayTotal = getCSVTotal('imBTC', 8, issuancePerDayCSV);
const pbtcIssuancePerDayTotal = getCSVTotal('pBTC', 18, issuancePerDayCSV);
const renbtcIssuancePerDayTotal = getCSVTotal('renBTC', 8, issuancePerDayCSV);
const sbtcIssuancePerDayTotal = getCSVTotal('sBTC', 18, issuancePerDayCSV);
const tbtcIssuancePerDayTotal = getCSVTotal('TBTC', 18, issuancePerDayCSV);
const wbtcIssuancePerDayTotal = getCSVTotal('WBTC', 8, issuancePerDayCSV);

console.log('hbtcIssuancePerDayTotal', hbtcIssuancePerDayTotal);
console.log('imbtcIssuancePerDayTotal', imbtcIssuancePerDayTotal);
console.log('pbtcIssuancePerDayTotal', pbtcIssuancePerDayTotal);
console.log('renbtcIssuancePerDayTotal', renbtcIssuancePerDayTotal);
console.log('sbtcIssuancePerDayTotal', sbtcIssuancePerDayTotal);
console.log('tbtcIssuancePerDayTotal', tbtcIssuancePerDayTotal);
console.log('wbtcIssuancePerDayTotal', wbtcIssuancePerDayTotal);
console.log();

const mintsAndBurnsCSV: string = fs.readFileSync('./mints-and-burns.csv').toString();

const hbtcMintsAndBurnsTotal = getCSVTotal('HBTC', 18, mintsAndBurnsCSV);
const imbtcMintsAndBurnsTotal = getCSVTotal('imBTC', 8, mintsAndBurnsCSV);
const pbtcMintsAndBurnsTotal = getCSVTotal('pBTC', 18, mintsAndBurnsCSV);
const renbtcMintsAndBurnsTotal = getCSVTotal('renBTC', 8, mintsAndBurnsCSV);
const sbtcMintsAndBurnsTotal = getCSVTotal('sBTC', 18, mintsAndBurnsCSV);
const tbtcMintsAndBurnsTotal = getCSVTotal('TBTC', 18, mintsAndBurnsCSV);
const wbtcMintsAndBurnsTotal = getCSVTotal('WBTC', 8, mintsAndBurnsCSV);

console.log('hbtcMintsAndBurnsTotal', hbtcMintsAndBurnsTotal);
console.log('imbtcMintsAndBurnsTotal', imbtcMintsAndBurnsTotal);
console.log('pbtcMintsAndBurnsTotal', pbtcMintsAndBurnsTotal);
console.log('renbtcMintsAndBurnsTotal', renbtcMintsAndBurnsTotal);
console.log('sbtcMintsAndBurnsTotal', sbtcMintsAndBurnsTotal);
console.log('tbtcMintsAndBurnsTotal', tbtcMintsAndBurnsTotal);
console.log('wbtcMintsAndBurnsTotal', wbtcMintsAndBurnsTotal);

function getCSVTotal(token: string, decimals: number, csv: string): string {
    return csv.split('\n').map((issuancePerDayRowString: string) => {
        return {
            token: issuancePerDayRowString.split(',')[0],
            date: issuancePerDayRowString.split(',')[1],
            amount: issuancePerDayRowString.split(',')[2]
        };
    }).filter((issuancePerDayRow: Readonly<IssuancePerDayRow>) => {
        return issuancePerDayRow.token === token;
    }).reduce((result: BigNumber, issuancePerDayRow: Readonly<IssuancePerDayRow>) => {
        return result.plus(issuancePerDayRow.amount);
    }, new BigNumber(0)).dividedBy(10**decimals).toString();
}