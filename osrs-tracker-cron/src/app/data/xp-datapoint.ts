export class XpDatapoint {
    [key: string]: number | Date | string;

    constructor(
        public playerId: number, 
        public date: Date, 
        public xpString: string
    ) { }
}