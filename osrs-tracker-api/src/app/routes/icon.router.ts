import fetch from 'node-fetch';
import express from 'express';
import { join } from 'path';
import { readFile, exists, createWriteStream } from 'fs';

export class IconRouter {

    static create(app: express.Application): void {
        const router = express.Router();

        this.getIcon(router);

        app.use('/icon', router);
    }

    private static getIcon(router: express.Router): void {
        router.get('/:id', (req, res) => {
            const itemId = req.params.id;
            const iconPath = join(__dirname, '/icons/', `${itemId}.gif`);

            this.iconExists(iconPath).then(exists => exists ?
                this.getIconFile(iconPath) :
                this.getIconUrl(itemId).then(iconUrl => this.downloadIcon(iconPath, iconUrl))
            ).then(iconFile => {
                res.type('image/gif');
                res.setHeader('Content-Disposition', `inline; filename="${itemId}.gif"`);
                res.send(iconFile);
            }).catch(() => res.sendStatus(404));
        });
    }

    private static iconExists(iconPath: string): Promise<boolean> {
        return new Promise(resolve => {
            exists(iconPath, exists => resolve(exists));
        });
    }

    private static getIconFile(iconPath: string): Promise<Buffer> {
        return new Promise(resolve => {
            readFile(iconPath, (err, data) => resolve(data));
        });
    }

    private static getIconUrl(itemId: number): Promise<string> {
        return fetch(`http://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=${itemId}`)
            .then(res => {
                if (res.status === 404) throw new Error('404');
                return res.json();
            })
            .then(body => body.item.icon_large);
    }

    private static downloadIcon(iconPath: string, iconUrl: string): Promise<Buffer> {
        return new Promise(resolve => {
            fetch(iconUrl).then().then(response => {
                const stream = createWriteStream(iconPath);
                stream.on('finish', () => resolve(this.getIconFile(iconPath)));
                response.body.pipe(stream);
            });
        });
    }

}
