import { PoolConnection } from 'mysql';
import { DbPlayer } from '../data/player';

export class PlayerRepository {

    static getPlayers(connection: PoolConnection): Promise<{ statusCode: number, players?: DbPlayer[] }> {
        return new Promise(resolve => {
            connection.query('SELECT p.id, p.username FROM Player p', (outerError, results: DbPlayer[], fields) => {
                if (outerError) {
                    resolve({ statusCode: 500 });
                } else if (results && results.length > 0) {
                    resolve({ statusCode: 200, players: results });
                } else {
                    resolve({ statusCode: 204 });
                }
            });
        });
    }

}