import { environment } from 'environments/environment';

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
  ) {}

  get trendClass() {
    return getTrendClass(this.today);
  }

  get icon() {
    return `${environment.API_GEPT}/icon/${this.id}`;
  }

  static empty() {
    return new ItemSearchModel(null, null, null, null, null);
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
  ) {}

  static empty() {
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
