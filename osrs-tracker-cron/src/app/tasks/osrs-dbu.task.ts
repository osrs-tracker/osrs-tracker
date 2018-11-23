import fetch from 'node-fetch';
import { API } from '../../config/api';
import { Logger } from '../common/logger';
import { Item } from '../data/item';
import { ItemRepository } from '../repositories/item.repository';

export class OsrsDbuTask {
    private readonly RS_API_BASE = 'http://services.runescape.com/m=itemdb_oldschool/api/catalogue';
    private readonly FETCH_INTERVAL = 6500;

    private categories: { letter: string, items: number }[] = [];
    private startTime: number;

    static runTask(): void {
        return new OsrsDbuTask().runTask();
    }

    runTask(): void {
        this.startTime = Date.now();
        Logger.logTask('OSRS_DBU', 'STARTED TASK');
        this.getCategories();
    }

    private getCategories(): void {
        fetch(`${this.RS_API_BASE}/category.json?category=1`)
            .then(response => response.json())
            .then(body => {
                this.categories = body.alpha;
                this.categories[0].letter = '%23';
                this.getCategoryItems(0);
            }).catch((err: Error) => Logger.logTaskError('OSRS_DBU', 'FETCH CATEGORIES ERROR', err));
    }

    private getCategoryItems(categoryIndex: number): void {
        const category = this.categories[categoryIndex];
        const pages = 1 + (category.items - (category.items % 12)) / 12;

        Promise.all([...new Array(pages)].map((el: undefined, index: number) => new Promise(
            resolve => setTimeout(() => { resolve(this.getPageItems(category, pages - index)); }, this.FETCH_INTERVAL * (index + 1))
        ))).then((itemCollections: Item[][]) => {
            const items = itemCollections.reduce((a: Item[], b: Item[]) => a.concat(b));

            API.getDbConnection(connection => ItemRepository.insertItems(items, connection))
                .then(() => {
                    if (categoryIndex < this.categories.length - 1) {
                        this.getCategoryItems(categoryIndex + 1);
                    } else {
                        Logger.logTaskSuccess('OSRS_DBU', `FINISHED TASK IN ${Math.round((Date.now() - this.startTime) / 1000)} SECONDS`);
                    }
                });
        });
    }

    private getPageItems(category: { letter: string, items: number }, page: number): Promise<Item[]> {
        return fetch(`${this.RS_API_BASE}/items.json?category=1&alpha=${category.letter}&page=${page}`)
            .then(response => response.json())
            .then(({ items }: { items: any[] }) =>
                items.map(item => new Item(item.id, item.name, item.description, item.current.price, item.today.price))
            ).catch(() => {
                Logger.logTaskError('OSRS_DBU', 'FETCH PAGE ERROR');
                return [];
            });
    }

}