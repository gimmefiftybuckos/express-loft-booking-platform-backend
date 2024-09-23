import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

import { AuthController } from './auth.controller';
import { TJWTData } from '../services/types';

export class UserController extends AuthController {
   protected verifyAuth = (
      req: Request<unknown, unknown, unknown, unknown>,
      res: Response
   ) => {
      const { authorization } = req.headers;

      try {
         const accessJWT = authorization?.split(' ')[1];
         if (accessJWT) {
            this.verifyJWT(accessJWT);
            return true;
         }
      } catch (error) {
         console.error(error);
         res.status(HttpStatusCode.Unauthorized).json({
            error: 'Invalid or expired token',
         });
         return false;
      }

      res.status(HttpStatusCode.Unauthorized).json({
         error: 'No token provided',
      });
      return false;
   };

   public refreshTokens = async (
      req: Request<unknown, unknown, { token: string }, unknown>,
      res: Response
   ) => {
      const { token } = req.body;

      const refreshJWT = token;
      if (refreshJWT) {
         const data = this.verifyJWT(refreshJWT) as TJWTData;

         const { login, email } = data;

         const userData = await this.getUser({ login });

         if (!userData) {
            return res
               .status(HttpStatusCode.Unauthorized)
               .json({ error: 'User Not Found' });
         }

         const { accessToken, refreshToken } = this.createTokens(email, login);

         const newUserData = {
            ...userData,
            accessToken,
            refreshToken,
         };

         return res.status(HttpStatusCode.Ok).json(newUserData);
      }
   };
}
