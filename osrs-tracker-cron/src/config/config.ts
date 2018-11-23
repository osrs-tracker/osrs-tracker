import { IConfig } from './config.interface';
import { readFileSync } from 'fs';
import { PoolConfig } from 'mysql';

const dbCredentials: PoolConfig = JSON.parse(readFileSync('/run/secrets/db-osrs-tracker.json', 'utf8'));

export const config: IConfig = {
    poolConfig: Object.assign(dbCredentials, {
        ssl: {
            ca: readFileSync('/run/secrets/db-ca.pem'),
            cert: readFileSync('/run/secrets/db-client-cert.pem'),
            key: readFileSync('/run/secrets/db-client-key.pem')
        }
    })
};