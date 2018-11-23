import { PoolConnection } from 'mysql';
import { XpDatapoint } from '../data/xp-datapoint';

export class XpRepository {

    static insertXpDataPoints(datapoints: XpDatapoint[], connection: PoolConnection): Promise<{ statusCode: number }> {
        const values = datapoints.map(datapoint => Object.keys(datapoint).map(key => datapoint[key]));

        return new Promise(resolve => {
            connection.query('INSERT INTO XPDatapoints(playerId, date, xpString) values ?', [values], (outerError, results, fields) => {
                resolve({ statusCode: !outerError && results && results.insertId ? 204 : 500 });
            });
        });
    }

}
