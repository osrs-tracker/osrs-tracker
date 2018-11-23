
import express from 'express';
import { API } from '../../config/api';
import { XpRepository } from '../repositories/xp.repository';

export class XpRouter {

    static create(app: express.Application): void {
        const router = express.Router();

        this.insertInitialXpDatapoint(router);
        this.getXpDatapointsForPlayer(router);

        app.use('/xp', router);
    }

    private static insertInitialXpDatapoint(router: express.Router): void {
        router.post('/:username/initialDatapoint', (req, res) => {
            API.getDbConnection(connection =>
                XpRepository.insertInitialXpDatapoint(req.params.username, req.body.xpString, connection).then(({ statusCode }) => {
                    res.status(statusCode);
                    res.send();
                })
            );
        });
    }

    private static getXpDatapointsForPlayer(router: express.Router): void {
        router.get('/:username/:period?', (req, res) => {
            API.getDbConnection(connection =>
                XpRepository.getXpDatapoints(req.params.username, +req.params.period, +req.query.offset, connection).then(({ statusCode, xpDatapoints }) => {
                    res.status(statusCode);
                    res.send(xpDatapoints);
                })
            );
        });
    }

}