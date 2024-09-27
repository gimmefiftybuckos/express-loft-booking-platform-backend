import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { IUserData, TUserResponse } from '../services/types';

import { DataBaseController } from './db.controller';

const key = process.env.JWT_KEY;

export abstract class AuthController extends DataBaseController {
   protected createJWT = (data: {
      email: string;
      login: string;
   }): string | false => {
      if (!key) {
         return false;
      }

      return jwt.sign(data, key, {
         expiresIn: '2d',
      });
   };

   protected createTokens = (email: string, login: string) => {
      const accessToken = this.createJWT({
         email,
         login,
      });

      const refreshToken = uuidv4();

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

   protected verifyAuth = (authorization: string | undefined) => {
      if (!authorization) {
         throw new Error(
            'Token verification failed: Authorization header is missing'
         );
      }

      const accessJWT = authorization.split(' ')[1];
      if (!accessJWT) {
         throw new Error(
            'Token verification failed: Authorization token is missing'
         );
      }

      return this.verifyTokenJWT(accessJWT);
   };

   protected createUserResponse = (userData: IUserData): TUserResponse => {
      return {
         accessToken: userData.accessToken,
         refreshToken: userData.refreshToken,
         user: {
            email: userData.email,
            login: userData.login,
         },
      };
   };
}
