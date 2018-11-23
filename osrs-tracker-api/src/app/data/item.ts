export class Item {
    [key: string]: number | string;

    constructor(
        public id: number,
        public name: string,
        public description: string,
        public current: string,
        public today: string
    ) { }

}