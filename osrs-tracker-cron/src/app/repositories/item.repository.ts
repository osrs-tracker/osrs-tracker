import { PoolConnection } from 'mysql';
import { Item } from '../data/item';

export class ItemRepository {

    static insertItems(items: Item[], connection: PoolConnection): Promise<{ statusCode: number }> {
        const values = items.map(item => Object.keys(item).map(key => item[key]));

        const query = `INSERT INTO Item(id, name, description, current, today) values ? 
                        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), current = VALUES(current), today = VALUES(today)`;
        return new Promise(resolve => {
            connection.query(query, [values], (outerError, results, fields) =>
                resolve({ statusCode: !outerError && results && results.insertId ? 204 : 500 })
            );
        });
    }
    
}