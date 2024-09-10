import { loadLoftCards, saveLoftCards } from './utils.js';

const content = loadLoftCards();

const randomNum = (min, max) =>
   Math.floor(Math.random() * (max - min + 1)) + min;

const rules = [
   'Нельзя шуметь после 23:00',
   'Можно взять алкоголь',
   'Можно принести еду',
   'Еда с собой',
   'Кейтеринг разрешен',
   'Разрешен кальян',
];

const types = [
   'recommendations',
   'coworking',
   'wedding',
   'dance',
   'graduation',
   'meeting',
   'party',
   'bars',
   'central_moscow',
   'lofts_15_guests',
   'corporate',
   'birthday',
   'kids',
];

const randomImage = (value) => {
   const res = [];
   for (let i = 0; i < value; i++) {
      const num = randomNum(1, 150);
      res.push(`loft${num}.png`);
   }
   return res;
};

const randomText = (value, arr) => {
   const res = [];
   const temp = new Set();
   for (let i = 0; i < value; i++) {
      const num = randomNum(0, arr.length - 1);

      if (!temp.has(num)) {
         res.push(arr[num]);
      } else {
         i--;
      }

      temp.add(num);
   }
   return res;
};

const randomDate = (value) => {
   const res = [];
   for (let i = 0; i < value; i++) {
      const day = randomNum(1, 30);
      const month = randomNum(9, 11);
      res.push(`${day}:${month}:2024`);
   }
   return res;
};

const updateData = () => {
   for (let item of content) {
      item.imageUrl = randomImage(20);
      item.rules = randomText(3, rules);
      item.type = randomText(2, types);
      item.bookingDates = randomDate(40);
      console.log(item);
   }
   saveLoftCards(content);
};

// updateData();
