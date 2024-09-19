import fs from 'fs';
import { ILoftCard, TStoragePath } from './types';

export enum storagePaths {
   LOFTS = 'loftCards.json',
   USERS = 'users.json',
}

const jsonFilePath = 'loftCards.json';

export const loadData = (path: TStoragePath): Array<ILoftCard> => {
   if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, 'utf-8');
      return JSON.parse(data);
   }
   return [];
};

export const saveData = <T>(elems: Array<T>, path: TStoragePath) => {
   fs.writeFileSync(path, JSON.stringify(elems, null, 2), 'utf-8');
};

export function shuffleArray(array: ILoftCard[]) {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
}

export const filterCards = (
   cards: ILoftCard[],
   filter: string,
   date: string,
   price: string
) => {
   return cards.filter((item) => {
      const [minPrice, maxPrice] = price.split(':');

      const filteredByType = filter ? item.type.includes(filter) : true;
      const filteredByDate = date ? !item.bookingDates.includes(date) : true;
      const filteredByPrice = maxPrice
         ? item.pricePerHour >= parseInt(minPrice) &&
           item.pricePerHour <= parseInt(maxPrice)
         : true;

      return filteredByType && filteredByDate && filteredByPrice;
   });
};

export const paginate = (array: ILoftCard[], limit: number, page: number) => {
   const startIndex = (page - 1) * limit;
   return array.slice(startIndex, startIndex + limit);
};
