import { Request, Response } from 'express';

import { TLoginData } from '../services/types';
import { AuthController } from './auth.controller';
import { comparePassword } from '../services/utils';
import { HttpStatusCode } from 'axios';

export class LoginController extends AuthController {
   public loginUser = async (
      req: Request<unknown, unknown, TLoginData>,
      res: Response
   ) => {
      const { login, password } = req.body;

      if (!login || !password) {
         return res
            .status(HttpStatusCode.BadRequest)
            .json({ error: 'Login and password are required' });
      }

      try {
         const userData = await this.getUser({ login });
         if (!userData) {
            return res
               .status(HttpStatusCode.BadRequest)
               .json({ error: 'Invalid login or password' });
         }

         const hashPassword = userData.registrData.password;
         const isValidPassword = await comparePassword(password, hashPassword);

         if (isValidPassword) {
            const email = userData.registrData.email;
            const { accessToken, refreshToken } = this.createTokens(
               email,
               login
            );

            const newUserData = {
               ...userData,
               accessToken,
               refreshToken,
            };

            await this.saveUserData(newUserData, login);

            return res
               .status(HttpStatusCode.Ok)
               .json(this.createUserResponse(newUserData));
         }

         return res
            .status(HttpStatusCode.BadRequest)
            .json({ error: 'Invalid login or password' });
      } catch (error) {
         console.error('Error during login', error);

         if (error instanceof Error) {
            return res
               .status(HttpStatusCode.InternalServerError)
               .json({ error: 'Internal Server Error: ' + error.message });
         } else {
            return res
               .status(HttpStatusCode.InternalServerError)
               .json({ error: 'Unknown error during login' });
         }
      }
   };
}
