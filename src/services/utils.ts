import fs from 'fs';
import { ILoftCard } from './types';

const jsonFilePath = 'loftCards.json';

export const loadLoftCards = (): Array<ILoftCard> => {
   if (fs.existsSync(jsonFilePath)) {
      const data = fs.readFileSync(jsonFilePath, 'utf-8');
      return JSON.parse(data);
   }
   return [];
};

export const saveLoftCards = (cards: ILoftCard[]) => {
   fs.writeFileSync(jsonFilePath, JSON.stringify(cards, null, 2), 'utf-8');
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
   console.log(array, limit, page);

   const startIndex = (page - 1) * limit;
   return array.slice(startIndex, startIndex + limit);
};
