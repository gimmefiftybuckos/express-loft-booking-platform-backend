import fs from 'fs';

const jsonFilePath = 'loftCards.json';

export const loadLoftCards = () => {
   if (fs.existsSync(jsonFilePath)) {
      const data = fs.readFileSync(jsonFilePath, 'utf-8');
      return JSON.parse(data);
   }
   return [];
};

export const saveLoftCards = (cards) => {
   fs.writeFileSync(jsonFilePath, JSON.stringify(cards, null, 2), 'utf-8');
};

export function shuffleArray(array) {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
}

export const filterCards = (cards, filter, date) => {
   return cards.filter((item) => {
      const filteredByType = filter ? item.type.includes(filter) : true;
      const filteredByDate = date ? !item.bookingDates.includes(date) : true;

      return filteredByType && filteredByDate;
   });
};

export const paginate = (array, limit, page) => {
   const startIndex = (page - 1) * limit;
   return array.slice(startIndex, startIndex + parseInt(limit, 10));
};
