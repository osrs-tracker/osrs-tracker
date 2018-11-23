import { PoolConnection } from 'mysql';
import { NewsPost } from '../data/news-post';

export class NewsRepository {

    static getNewsItem(newsId: number, uuid: string, connection: PoolConnection): Promise<{ statusCode: number, newsPost?: NewsPost }> {
        const query = `SELECT *,
                        (select count(*) from NewsVote where newsId = n.id and value = 1) as upvotes,
                        (select count(*) from NewsVote where newsId = n.id and value = -1) as downvotes,
                        (select value from NewsVote where newsId = n.id and uuid = ?) as vote
                        FROM News n WHERE n.id = ?`;
        return new Promise(resolve => {
            connection.query(query, [uuid, +newsId], (outerError, [result]: NewsPost[], fields) => {
                if (outerError) {
                    resolve({ statusCode: 500 });
                } else if (result) {
                    resolve({ statusCode: 200, newsPost: result });
                } else {
                    resolve({ statusCode: 404 });
                }
            });
        });
    }

    static getNewsItems(uuid: string, offset: number, connection: PoolConnection): Promise<{ statusCode: number, newsPosts?: NewsPost[] }> {
        const query = `SELECT *,
                        (select count(*) from NewsVote where newsId = n.id and value = 1) as upvotes,
                        (select count(*) from NewsVote where newsId = n.id and value = -1) as downvotes,
                        (select value from NewsVote where newsId = n.id and uuid = ?) as vote
                        FROM News n ORDER BY date DESC LIMIT 5 OFFSET ?`;
        return new Promise(resolve => {
            connection.query(query, [uuid, offset || 0], (outerError, results: NewsPost[], fields) => {
                if (outerError) {
                    resolve({ statusCode: 500 });
                } else if (results && results.length > 0) {
                    resolve({ statusCode: 200, newsPosts: results });
                } else {
                    resolve({ statusCode: 404 });
                }
            });
        });
    }

    private static vote(newsId: number, uuid: string, value: number, connection: PoolConnection): Promise<{ statusCode: number }> {
        const query = `INSERT INTO NewsVote (newsId, uuid, value) VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE value = (CASE WHEN value = ? THEN 0 ELSE ? END)`;
        const params = [newsId, uuid, value, value, value];
        return new Promise(resolve => {
            connection.query(query, params, (outerError, results, fields) =>
                resolve({ statusCode: !outerError && results && results.insertId ? 204 : 500 })
            );
        });
    }

    static upvote(newsId: number, uuid: string, connection: PoolConnection): Promise<{ statusCode: number }> {
        return this.vote(newsId, uuid, 1, connection);
    }

    static downvote(newsId: number, uuid: string, connection: PoolConnection): Promise<{ statusCode: number }> {
        return this.vote(newsId, uuid, -1, connection);
    }

}
