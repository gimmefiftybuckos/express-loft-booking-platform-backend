import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { TRegisterData, TUserData } from '../services/types';
import { hashValue } from '../services/utils';
import { HttpStatusCode } from '../services/HttpStatusCode';

import { AuthController } from './auth.controller';

export class RegistrController extends AuthController {
   public registerUser = async (
      req: Request<unknown, unknown, TRegisterData>,
      res: Response
   ) => {
      const { email, login, password } = req.body;

      if (!email || !login || !password) {
         return res
            .status(HttpStatusCode.BAD_REQUEST)
            .json({ error: 'Email, login and password are required' });
      }

      try {
         const isUserExists = await this.getUser({ login, email });
         if (isUserExists) {
            return res
               .status(HttpStatusCode.BAD_REQUEST)
               .json({ error: 'Login or email already in use' });
         }

         const newUserData = await this.createUser(email, login, password);
         await this.saveUserData(newUserData, login);

         return res
            .status(HttpStatusCode.OK)
            .json(this.createUserResponse(newUserData));
      } catch (error) {
         console.error('Error during registration', error);

         if (error instanceof Error) {
            return res
               .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
               .json({ error: 'Internal Server Error: ' + error.message });
         } else {
            return res
               .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
               .json({ error: 'Unknown error during registration' });
         }
      }
   };

   private createUser = async (
      email: string,
      login: string,
      password: string
   ): Promise<TUserData> => {
      const { accessToken, refreshToken } = this.createTokens(email, login);
      const id = uuidv4();
      const hash = await hashValue(password);

      return {
         userId: id,
         registrData: {
            email,
            login,
            password: hash,
         },
         registrTime: new Date(),
         accessToken,
         refreshToken,
      };
   };
}
