import chalk from 'chalk';

export class Logger {
    static log(...message: any[]): void {
        console.log(`[${new Date().toLocaleTimeString()}]`, ...message);
    }

    static logSuccess(...message: any[]): void {
        Logger.log(chalk.green(message.reduce((a, b) => `${a} ${b}`)));
    }

    static logWarning(...message: any[]): void {
        Logger.log(chalk.yellow(message.reduce((a, b) => `${a} ${b}`)));
    }

    static logError(...message: any[]): void {
        Logger.log(chalk.red(message.reduce((a, b) => `${a} ${b}`)));
    }

    static logTask(name: string, ...message: any[]): void {
        this.log(`${name}:`, ...message);
    }
    static logTaskSuccess(name: string, ...message: any[]): void {
        this.logSuccess(`${name}:`, ...message);
    }
    static logTaskWarning(name: string, ...message: any[]): void {
        this.logWarning(`${name}:`, ...message);
    }
    static logTaskError(name: string, ...message: any[]): void {
        this.logError(`${name}:`, ...message);
    }
}
