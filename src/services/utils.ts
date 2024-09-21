import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
require('dotenv').config();

import { ILoftCard, TStoragePath } from './types';

const key = process.env.SECRET_KEY;
const iv = process.env.IV;

export const loadData = (path: TStoragePath): Array<ILoftCard> => {
   if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, 'utf-8');
      return JSON.parse(data);
   }
   return [];
};

export const saveData = <T>(elems: T, path: TStoragePath) => {
   fs.writeFileSync(path, JSON.stringify(elems, null, 2), 'utf-8');
};

export const checkFileExists = async (filePath: string): Promise<boolean> => {
   try {
      await fs.promises.access(filePath);
      return true;
   } catch (error) {
      return false;
   }
};

export const writeFile = async (
   dirPath: string,
   filePath: string,
   data: any
) => {
   try {
      await fs.promises.mkdir(dirPath, { recursive: true });

      const fileExists = await checkFileExists(filePath);

      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));

      if (fileExists) {
         console.warn(`File ${filePath} is overwritten`);
      }
   } catch (error) {
      console.error('Error writing the file');
   }
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

export const encrypt = (value: string) => {
   if (!key || !iv) {
      console.error('Crypto key is undefined');
      throw Error('Invalid crypto key');
   }

   const cipher = crypto.createCipheriv(
      'aes-128-cbc',
      Buffer.from(key),
      Buffer.from(iv, 'hex')
   );
   let encrypted = cipher.update(value);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return iv + '_' + encrypted.toString('hex');
};

export const decrypt = (value: string) => {
   if (!key) {
      console.error('Crypto key is undefined');
      throw Error('Invalid crypto key');
   }

   const parts = value.split('_');
   const iv = Buffer.from(parts[1], 'hex');
   const encryptedText = Buffer.from(parts[2], 'hex');
   const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(key),
      iv
   );
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
};

export const hashValue = async (value: string): Promise<string> => {
   const saltRounds = 10;
   const salt = await bcrypt.genSalt(saltRounds);
   const hash = await bcrypt.hash(value, salt);

   return hash;
};

export const comparePassword = async (
   password: string,
   hash: string
): Promise<boolean> => {
   const match = await bcrypt.compare(password, hash);
   return match;
};
