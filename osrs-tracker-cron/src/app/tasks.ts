import { CronJob } from 'cron';
import { OsrsDbuTask } from './tasks/osrs-dbu.task';
import { XpTrackerTask } from './tasks/xp-tracker.task';

export class Tasks {

    static init(): void {
        this.startJob('0 0 0 * * *', XpTrackerTask.runTask);
        this.startJob('0 0 * * * *', OsrsDbuTask.runTask);
    }

    private static startJob(cron: string, task: () => void): void {
        new CronJob(cron, task, undefined, true, 'UTC');
    }

}