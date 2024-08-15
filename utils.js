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
