import { createPool, PoolConnection } from 'mysql';
import { config } from './config';
import { Logger } from '../app/common/logger';

export class API {
    static readonly DB_POOL = createPool({
        ...config.poolConfig,
        connectionLimit: 20,
        timezone: 'Z',
    });

    private static setupDbConnection(): Promise<PoolConnection> {
        return new Promise<PoolConnection>((resolve, reject) => {
            const MAX_RETRY_COUNT = 3;
            let retryCount = 0;
            const getConnection = () => this.DB_POOL.getConnection((err, connection) => {
                retryCount++;
                if (retryCount < MAX_RETRY_COUNT && (err || !connection)) {
                    Logger.logWarning('FAILED TO CONNECT WITH DATABASE - RETRYING IN 1 SECOND.', err);
                    setTimeout(() => { getConnection(); }, 1000);
                }
                else if (retryCount >= MAX_RETRY_COUNT) {
                    reject();
                }
                else resolve(connection);
            });
            getConnection();
        });
    }

    static getDbConnection(dbConnectionLogic: (connection: PoolConnection) => Promise<any>): Promise<void> {
        return API.setupDbConnection()
            .catch(err => {
                Logger.logError('FAILED TO SETUP DATABASE CONNECTION.', err);
                return null;
            })
            .then((connection: PoolConnection) => {
                if (!connection) return;
                return dbConnectionLogic(connection)
                    .then(() => connection.release())
                    .catch((err) => {
                        Logger.logError('UNEXPECTED ERROR OCCURED.', err);
                        try { connection.release(); } catch (e) { /* Could be released already. */ }
                    });
            });
    }
}