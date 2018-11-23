import cluster from 'cluster';

import { Logger } from './app/common/logger';
import { Tasks } from './app/tasks';

if (cluster.isMaster) {
    Logger.log('SERVER ACTIVE - FORKING WORKER');
    cluster.fork();

    cluster.on('exit', (worker: cluster.Worker) => {
        Logger.log(`WORKER ${worker.id} DIED - CREATING NEW WORKER`);
        cluster.fork();
    });
} else {
    Logger.log(`WORKER ${cluster.worker.id} CREATED - INITIALISING TASKS`);
    Tasks.init();
}