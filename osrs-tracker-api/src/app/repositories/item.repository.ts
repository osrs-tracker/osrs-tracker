import { PoolConnection } from 'mysql';
import { Item } from '../data/item';

export class ItemRepository {

    static getItem(itemId: number, connection: PoolConnection): Promise<{ statusCode: number, items?: Item[] }> {
        return new Promise(resolve => {
            connection.query('SELECT * FROM Item WHERE id = ?', itemId, (outerError, results: Item[], fields) => {
                if (outerError) {
                    resolve({ statusCode: 500 });
                } else if (results && results.length > 0) {
                    resolve({
                        statusCode: 200,
                        items: results
                    });
                } else {
                    resolve({ statusCode: 404 });
                }
            });
        });
    }

    static getItems(query: string, connection: PoolConnection): Promise<{ statusCode: number, items?: Item[] }> {
        return new Promise(resolve => {
            connection.query('SELECT * FROM Item WHERE name LIKE ?', [`%${query}%`], (outerError, results: Item[], fields) => {
                if (outerError) {
                    resolve({ statusCode: 500 });
                } else if (results && results.length > 0) {
                    resolve({ statusCode: 200, items: results });
                } else {
                    resolve({ statusCode: 204 });
                }
            });
        });
    }

}