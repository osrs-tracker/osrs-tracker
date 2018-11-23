import { Application } from 'express';

import { API } from '../config/api';
import { IndexPage } from './routes/pages/index.page';
import { XpRouter } from './routes/xp.router';
import { IconRouter } from './routes/icon.router';
import { ItemRouter } from './routes/item.router';
import { NewsRouter } from './routes/news.router';
import { PlayerRouter } from './routes/player.router';

export class Routes {

    static init(app: Application): void {
        this.initIndexRoute(app);
        
        IconRouter.create(app);
        ItemRouter.create(app);
        NewsRouter.create(app);
        PlayerRouter.create(app);
        XpRouter.create(app);
    }

    private static initIndexRoute(app: Application): void {
        app.get('/', (req, res, next) => {
            res.type('text/html');
            res.send(IndexPage(API.CONFIG.VERSION));
            return next();
        });
    }

}
