import { PlayerType } from '../data/player-type';
import { PoolConnection } from 'mysql';
import { Player, DbPlayer } from '../data/player';

export class PlayerRepository {

    static getPlayer(username: string, connection: PoolConnection): Promise<{ statusCode: number, player?: Player }> {
        const query = 'SELECT p.*, pt.type FROM Player p JOIN PlayerType pt ON p.playerType = pt.id WHERE username = ?';
        return new Promise(resolve => {
            connection.query(query, [username.toLowerCase()], (outerError, [result]: DbPlayer[], fields) => {
                if (outerError) {
                    resolve({ statusCode: 500 });
                } else if (result) {
                    resolve({
                        statusCode: 200,
                        player: {
                            username: result.username,
                            playerType: result.type,
                            deIroned: result.deIroned,
                            dead: result.dead,
                            lastChecked: result.lastChecked,
                        }
                    });
                } else {
                    resolve({ statusCode: 404 });
                }
            });
        });
    }

    static getDbPlayer(username: string, connection: PoolConnection): Promise<DbPlayer> {
        return new Promise(resolve => {
            connection.query('SELECT * FROM Player where username = ?', [username], (outerError, results: DbPlayer[], fields) => {
                resolve(results && results.length > 0 ? results[0] : null);
            });
        });
    }

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

    static insertPlayer({ username, playerType, deIroned, dead }: Player, connection: PoolConnection): Promise<{ statusCode: number }> {
        const query = ` INSERT INTO Player (username, playerType, deIroned, dead) VALUES (?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE deIroned = ?, dead = ?, lastChecked = current_timestamp`;
        const params = [username.toLowerCase(), PlayerType[playerType], deIroned, dead, deIroned, dead];
        return new Promise(resolve => {
            connection.query(query, params, (outerError, results, fields) => {
                if (!outerError && results && results.affectedRows > 0) {
                    resolve({ statusCode: results.affectedRows === 2 ? 204 : 201 });
                } else resolve({ statusCode: 500 });
            });
        });
    }
}