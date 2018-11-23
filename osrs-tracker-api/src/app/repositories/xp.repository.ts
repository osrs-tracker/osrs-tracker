import { PoolConnection } from 'mysql';
import { XpDatapoint } from '../data/xp-datapoint';

export class XpRepository {

    static getXpDatapoints(username: string, period: number, offset: number, connection: PoolConnection): Promise<{ statusCode: number, xpDatapoints?: { date: Date, xpString: string }[] }> {
        const query = `SELECT xp.date, xp.xpString FROM XPDatapoints xp JOIN Player p on xp.playerId = p.id
                        WHERE p.username = ? ORDER BY xp.date DESC LIMIT ? OFFSET ?`;
        return new Promise(resolve => {
            connection.query(query, [username.toLowerCase(), period || 7, offset || 0], (outerError, results: XpDatapoint[], fields) => {
                if (outerError) {
                    resolve({ statusCode: 500 });
                } else if (results && results.length > 0) {
                    resolve({
                        statusCode: 200,
                        xpDatapoints: results.map(xpDatapoint => ({
                            date: xpDatapoint.date,
                            xpString: xpDatapoint.xpString
                        })),
                    });
                } else {
                    resolve({ statusCode: 404});
                }
            });
        });
    }

    static insertInitialXpDatapoint(username: string, xpString: string, connection: PoolConnection): Promise<{ statusCode: number }> {
        return new Promise(resolve => {
            const hasDatapoint = 'SELECT count(*) as count FROM XPDatapoints xp JOIN Player p ON xp.playerId = p.id WHERE p.username = ?';
            connection.query(hasDatapoint, [username], (outerError, results, fields) => {
                if (outerError) {
                    resolve({ statusCode: 500});
                } else if(results && results.length > 0 && results[0].count === 0) {
                    const insertDatapoint = `INSERT INTO XPDatapoints(playerId, date, xpString) 
                                             SELECT id as playerId, ? as date, ? as xpString FROM Player p WHERE p.username = ?`;
                    connection.query(insertDatapoint, [new Date(), xpString, username], (outerError, results, fields) => {
                        resolve({ statusCode: !outerError && results && results.insertId ? 204 : 500 });
                    });
                } else {
                    resolve({ statusCode: 403 });
                }
            });
        });        
    }

}
