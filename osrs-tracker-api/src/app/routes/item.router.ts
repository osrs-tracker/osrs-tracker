import express from 'express';
import { API } from '../../config/api';
import { ItemRepository } from '../repositories/item.repository';

export class ItemRouter {

    static create(app: express.Application): void {
        const router = express.Router();

        this.getItem(router);
        this.getItems(router);

        app.use('/item', router);
    }

    private static getItem(router: express.Router): void {
        router.get('/:id', (req, res) => {
            API.getDbConnection(connection =>
                ItemRepository.getItem(req.params.id, connection).then(({ statusCode, items }) => {
                    res.status(statusCode);
                    res.send(items);
                })
            );
        });

    }

    private static getItems(router: express.Router): void {
        router.get('/', (req, res) => {
            API.getDbConnection(connection =>
                ItemRepository.getItems(req.query.query, connection).then(({ statusCode, items }) => {
                    res.status(statusCode);
                    res.send(items);
                })
            );
        });
    }

}