import { createPool, PoolConnection } from 'mysql';
import { config } from './config';
import { Logger } from '../app/common/logger';
import { Response } from 'express';

export class API {

    static readonly DB_POOL = createPool({
        ...config.poolConfig,
        connectionLimit: 20,
        timezone: 'Z',
    });

    static readonly CONFIG = {
        VERSION: VERSION,
        PORT: process.env.PORT || 4300,
    };

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
                    Logger.logError('FAILED TO CONNECT WITH DATABASE.');
                    reject();
                }
                else resolve(connection);
            });
            getConnection();
        });
    }

    static getDbConnection(dbConnectionLogic: (connection: PoolConnection) => Promise<any>, res?: Response): Promise<void> {
        return API.setupDbConnection()
            .catch(() => {
                if (res) res.sendStatus(503);
                return null;
            })
            .then((connection: PoolConnection) => {
                if (!connection) return;
                return dbConnectionLogic(connection)
                    .then(() => connection.release())
                    .catch((err) => {
                        Logger.logError('UNEXPECTED ERROR OCCURED.', err);
                        try { connection.release(); } catch (e) { /* Could be released already. */ }
                        if (res) res.sendStatus(500);
                    });
            });
    }
}