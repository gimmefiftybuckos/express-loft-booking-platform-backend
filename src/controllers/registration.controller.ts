import { Request, Response } from 'express';

import { IRegisterData, IUserData } from '../services/types';
import { encrypt, hashValue } from '../services/utils';

import { AuthController } from './auth.controller';
import { HttpStatusCode } from 'axios';

export class RegistrController extends AuthController {
   public registerUser = async (
      req: Request<unknown, unknown, IRegisterData>,
      res: Response
   ) => {
      const { email, login, password } = req.body;

      if (!email || !login || !password) {
         return res
            .status(HttpStatusCode.BadRequest)
            .json({ error: 'Email, login and password are required' });
      }

      try {
         const isUserExists = await this.getUserDB({ login, email });

         if (!isUserExists) {
            const userData = await this.createUser(email, login, password);
            await this.saveUserDB(userData);
            await this.saveTokenDB(userData.login, userData.refreshToken);

            return res
               .status(HttpStatusCode.Ok)
               .json(this.createUserResponse(userData));
         }

         return res
            .status(HttpStatusCode.BadRequest)
            .json({ error: 'Login or email already in use' });
      } catch (error) {
         console.error('Error during registration', error);

         if (error instanceof Error) {
            return res
               .status(HttpStatusCode.InternalServerError)
               .json({ error: 'Internal Server Error: ' + error.message });
         } else {
            return res
               .status(HttpStatusCode.InternalServerError)
               .json({ error: 'Unknown error during registration' });
         }
      }
   };

   private createUser = async (
      email: string,
      login: string,
      password: string
   ): Promise<IUserData> => {
      const { accessToken, refreshToken } = this.createTokens(email, login);
      const id = encrypt(login);
      const hash = await hashValue(password);

      return {
         id: id,
         email,
         login,
         password: hash,
         registrTime: new Date(),
         accessToken,
         refreshToken,
      };
   };
}
