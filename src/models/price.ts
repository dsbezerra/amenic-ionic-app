
/** Price model */
export interface IPrice {
  is2D: boolean;
  value: number;
  weekdays: number[];
}

/** Local price used by database */
export interface ILocalPrice {
  id: number;
  is2D: number;
  value: number;
  weekdays: string;
}

/** Maps local price to model */
export const mapLocalPrice = (localPrice: ILocalPrice, index?: number): IPrice => {
  const result: IPrice = {
    is2D: localPrice.is2D === 1,
    value: localPrice.value,
    weekdays: localPrice.weekdays.split(';').map(day => parseInt(day)),
  };

  return result;
}