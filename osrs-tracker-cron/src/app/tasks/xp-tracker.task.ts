import fetch from 'node-fetch';
import { API } from '../../config/api';
import { Logger } from '../common/logger';
import { DbPlayer } from '../data/player';
import { XpDatapoint } from '../data/xp-datapoint';
import { PlayerRepository } from '../repositories/player.repository';
import { XpRepository } from '../repositories/xp.repository';

export class XpTrackerTask {
    private readonly HISCORE_URL = 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=';
    private readonly FETCH_DELAY = 500;

    private failedPlayers: DbPlayer[] = [];
    private startTime: number;

    static runTask(): void {
        return new XpTrackerTask().runTask();
    }

    runTask(): void {
        this.startTime = Date.now();
        Logger.logTask('XP_TRACKER', 'STARTED TASK');

        API.getDbConnection(connection =>
            PlayerRepository.getPlayers(connection).then(result => {
                if (result.statusCode === 500) {
                    Logger.logTask('XP_TRACKER', 'FAILED TO RETRIEVE PLAYERS - RESTARTING IN 5 MINUTES');
                    setTimeout(() => this.runTask(), 5 * 60 * 1000);
                } else {
                    this.fetchPlayerData(result.players);
                }
            })
        );
    }

    private fetchPlayerData(players: DbPlayer[]): void {
        this.failedPlayers = [];
        Promise.all(players.map((player, index) =>
            new Promise(resolve => setTimeout(() => { resolve(this.lookupDbPlayer(player)); }, index * this.FETCH_DELAY))
        )).then((datapoints: XpDatapoint[]) => this.insertDatapointsAsChunks(datapoints.filter(datapoint => datapoint !== undefined)));
    }

    private lookupDbPlayer(player: DbPlayer): Promise<XpDatapoint | void> {
        return fetch(this.HISCORE_URL + player.username)
            .then(res => res.ok ? res.text() : null)
            .then(xpString => {
                if (!xpString) {
                    return undefined; // player not found (no player with that name)
                } else if (xpString.length > 1024) {
                    this.failedPlayers.push(player); // received RuneScape splash site.
                } else return {
                    playerId: player.id,
                    date: this.getYesterdayAsUTC(),
                    xpString: xpString,
                };
            }).catch(err => {
                this.failedPlayers.push(player); // another error (redirect?)
                Logger.logTask('XP_TRACKER', 'UNEXPECTED ERROR:', err);
            });
    }

    private insertDatapointsAsChunks(datapoints: XpDatapoint[]): void {
        const datapointChunks = this.chunk<XpDatapoint>(datapoints, 250);

        const insertChunks = Promise.resolve();

        datapointChunks.forEach(datapointChunk => insertChunks.then(() => this.insertChunk(datapointChunk)));

        insertChunks.then(() => {
            if (this.failedPlayers.length > 0) {
                Logger.logTask('XP_TRACKER', `FAILED TO INSERT ${this.failedPlayers.length} PLAYERS - RETRYING IN 1 MINUTE`);
                setTimeout(() => this.fetchPlayerData(this.failedPlayers.slice(0)), 60 * 1000);
            } else {
                Logger.logTask('XP_TRACKER', `FINISHED TASK IN ${Math.round((Date.now() - this.startTime) / 1000)} SECONDS`);
            }
        });
    }

    private insertChunk(datapoints: XpDatapoint[]): Promise<void> {
        return API.getDbConnection(connection => XpRepository.insertXpDataPoints(datapoints, connection));
    }

    private getYesterdayAsUTC(): Date {
        const date = new Date();
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1);
    }

    private chunk<T>(array: T[], chunkLength: number): T[][] { // splits array into chunks
        const chunks = [];
        const arrayLength = array.length;

        let i = 0;
        while (i < arrayLength) { chunks.push(array.slice(i, i += chunkLength)); }

        return chunks;
    }

}