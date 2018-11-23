export class NewsPost {
    constructor(
        public id: number,
        public title: string,
        public date: Date,
        public category: string,
        public content: string,
        public upvotes: number,
        public downvotes: number,
        public vote: number
    ) { }
}