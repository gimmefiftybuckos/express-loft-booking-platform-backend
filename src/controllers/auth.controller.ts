import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

import { TFavoritesData, TUserData, TUserResponse } from '../services/types';
import { StoragePaths, TypeJWT, usersDir } from '../services/constants';

import {
   checkFileExists,
   encrypt,
   loadData,
   saveData,
   saveNewUserDir,
} from '../services/utils';

const key = process.env.JWT_KEY;

export abstract class AuthController {
   protected saveUserData = async (userData: TUserData, login: string) => {
      try {
         const userKey = encrypt(login);
         const userDirPath = path.resolve(usersDir, `user_${userKey}`);
         const userFilePath = path.join(userDirPath, 'user.json');
         await saveNewUserDir(userDirPath, userFilePath, userData);
      } catch (error) {
         console.error('Error saving user data:', error);

         if (error instanceof Error) {
            throw new Error(`Failed to save user data: ${error.message}`);
         } else {
            throw new Error('Unknown error while saving user data');
         }
      }
   };

   protected saveUserFavorite = async (
      newData: TFavoritesData,
      login: string
   ) => {
      try {
         const userKey = encrypt(login);
         const userDirPath = path.resolve(usersDir, `user_${userKey}`);
         const userFilePath = path.join(userDirPath, StoragePaths.FAVORITES);

         const isExists = await checkFileExists(userFilePath);

         if (!isExists) {
            await saveData([newData], userFilePath);
            return newData;
         }

         const data = await loadData<TFavoritesData>(userFilePath);

         const isFavoriteIndex = data.findIndex(
            (item) => item.id === newData.id
         );

         if (isFavoriteIndex >= 0) {
            data.splice(isFavoriteIndex, 1);
            await saveData(data, userFilePath);
            return data;
         }

         data.push(newData);

         await saveData(data, userFilePath);

         return data;
      } catch (error) {
         console.error('Error saving user favorites:', error);

         if (error instanceof Error) {
            throw new Error(`Failed to save user favorites: ${error.message}`);
         } else {
            throw new Error('Unknown error while saving user favorites');
         }
      }
   };

   protected createJWT = (data: {
      email: string;
      login: string;
      type: TypeJWT;
   }): string | false => {
      if (!key) {
         return false;
      }

      if (data.type === TypeJWT.ACCESS) {
         return jwt.sign(data, key, {
            expiresIn: '2d',
         });
      }

      if (data.type === TypeJWT.REFRESH) {
         return jwt.sign(data, key, {
            expiresIn: '30d',
         });
      }

      return false;
   };

   protected createTokens = (email: string, login: string) => {
      const accessToken = this.createJWT({
         email,
         login,
         type: TypeJWT.ACCESS,
      });

      const refreshToken = this.createJWT({
         email,
         login,
         type: TypeJWT.REFRESH,
      });

      if (!accessToken || !refreshToken) {
         throw new Error('Failed to create JWT token');
      }

      return { accessToken, refreshToken };
   };

   protected verifyTokenJWT = (token: string) => {
      try {
         if (!key) {
            throw new Error('Missing JWT key');
         }

         const decoded = jwt.verify(token, key);
         return decoded;
      } catch (error) {
         console.error('JWT Verification Error:', error);
         throw new Error('Token verification failed: Invalid or expired token');
      }
   };

   protected createUserResponse = (userData: TUserData): TUserResponse => {
      return {
         accessToken: userData.accessToken,
         refreshToken: userData.refreshToken,
         user: {
            email: userData.registrData.email,
            login: userData.registrData.login,
         },
      };
   };

   protected findUser = async (data: {
      email?: string;
      login: string;
      id?: string;
   }): Promise<TUserData | false> => {
      if (!usersDir) {
         console.error(`User directory was created on ${usersDir} path`);
         return false;
      }

      const userDir = `${usersDir}/user_${encrypt(data.login)}`;

      const dir = await checkFileExists(userDir);

      if (!dir) {
         return false;
      }

      const userFilePath = path.join(userDir, StoragePaths.USER);

      const isExist = await checkFileExists(userFilePath);

      if (isExist) {
         const userFile = await fs.promises.readFile(userFilePath, 'utf-8');
         const userData: TUserData = JSON.parse(userFile);

         const existingLogin = userData.registrData.login;
         const existingEmail = userData.registrData.email;
         const existingId = userData.userId;

         if (
            existingLogin === data.login ||
            existingEmail === data.email ||
            existingId === data.id
         ) {
            return userData;
         }
      }
      return false;
   };
}
