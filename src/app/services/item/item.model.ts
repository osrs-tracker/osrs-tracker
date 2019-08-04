import { environment } from 'src/environments/environment';

export const getTrendClass = (signedPrice: string) => {
    if (!signedPrice) {
        return '';
    }
    if (signedPrice.startsWith('+')) {
        return 'positive';
    }
    if (signedPrice.startsWith('-')) {
        return 'negative';
    }
    return '';
};

export class ItemSearchModel {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public current: string,
        public today: string
    ) { }

    get trendClass(): string {
        return getTrendClass(this.today);
    }

    get icon(): string {
        return `${environment.API_OSRS_TRACKER}/icon/${this.id}`;
    }
}

export class ItemDetailModel {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public members: boolean,
        public current: { trend: string; price: string },
        public today: { trend: string; price: string },
        public day30: { trend: string; change: string },
        public day90: { trend: string; change: string },
        public day180: { trend: string; change: string }
    ) { }

    static empty(): ItemDetailModel {
        return new ItemDetailModel(
            0,
            '',
            '...',
            false,
            { trend: '', price: '' },
            { trend: '', price: '' },
            { trend: '', change: '' },
            { trend: '', change: '' },
            { trend: '', change: '' }
        );
    }
}
