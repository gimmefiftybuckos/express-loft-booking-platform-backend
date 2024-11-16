import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
require('dotenv').config();

import { ILoft, TStoragePath } from './types';

const KEY = process.env.SECRET_KEY;
const IV = process.env.IV;

export const encrypt = (value: string) => {
   if (!KEY || !IV) {
      console.error('Crypto key is undefined');
      throw Error('Invalid crypto key');
   }

   const cipher = crypto.createCipheriv(
      'aes-128-cbc',
      Buffer.from(KEY),
      Buffer.from(IV, 'hex')
   );
   let encrypted = cipher.update(value);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return encrypted.toString('hex');
};

export const decrypt = (value: string) => {
   if (!KEY || !IV) {
      console.error('Crypto key is undefined');
      throw Error('Invalid crypto key');
   }

   const encryptedText = Buffer.from(value, 'hex');
   const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(KEY),
      Buffer.from(IV, 'hex')
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

/*
   Legacy methods
*/

const filterCards = (
   cards: ILoft[],
   filter: string,
   date: string,
   price: string
) => {
   return cards.filter((item) => {
      const [minPrice, maxPrice] = price.split(':');

      const filteredByType = filter ? item.type.includes(filter) : true;
      const filteredByDate = date ? !item.bookingDates.includes(date) : true;
      const filteredByPrice = maxPrice
         ? item.price >= parseInt(minPrice) && item.price <= parseInt(maxPrice)
         : true;

      return filteredByType && filteredByDate && filteredByPrice;
   });
};

const paginate = (array: ILoft[], limit: number, page: number) => {
   const startIndex = (page - 1) * limit;
   return array.slice(startIndex, startIndex + limit);
};

const checkFileExists = async (filePath: string): Promise<boolean> => {
   try {
      await fs.promises.access(filePath);
      return true;
   } catch (error) {
      return false;
   }
};

export const loadData = async <T>(
   path: TStoragePath | string
): Promise<Array<T>> => {
   try {
      await checkFileExists(path);
      const data = await fs.promises.readFile(path, 'utf-8');
      return JSON.parse(data);
   } catch (error) {
      console.error(`Error loading data from ${path}:`, error);
      throw new Error('Error loading data from storage');
   }
};

export const saveData = async <T>(
   elems: T,
   path: TStoragePath | string
): Promise<void> => {
   try {
      await fs.promises.writeFile(
         path,
         JSON.stringify(elems, null, 2),
         'utf-8'
      );
   } catch (error) {
      console.error(`Error saving data to ${path}:`, error);
      throw new Error('Error saving data to storage');
   }
};

function shuffleArray(array: ILoft[]) {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
}
