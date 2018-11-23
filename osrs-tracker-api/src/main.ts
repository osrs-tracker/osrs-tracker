import os from 'os';
import cluster from 'cluster';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';

import { Logger } from './app/common/logger';
import { API } from './config/api';
import { Routes } from './app/routes';
import { FileSystemUtil } from './app/common/file-system-util';

if (cluster.isMaster) {
    FileSystemUtil.createIconsFolderIfMissing();
    Logger.log('SERVER ACTIVE - FORKING WORKERS');

    os.cpus().forEach(() => cluster.fork());

    cluster.on('exit', (worker: cluster.Worker) => {
        Logger.log(`WORKER ${worker.id} DIED - CREATING NEW WORKER`);
        cluster.fork();
    });
} else {
    const app = express();

    app.use(helmet({ noCache: true }));
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.listen(API.CONFIG.PORT, () => {
        Logger.log(`WORKER ${cluster.worker.id} CREATED ON PORT ${API.CONFIG.PORT}`);
        Routes.init(app);
    });
}