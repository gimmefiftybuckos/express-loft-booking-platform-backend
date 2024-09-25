import { AxiosError, HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

import { AuthController } from './auth.controller';
import { TJWTData } from '../services/types';
import { error } from 'console';

export class UserController extends AuthController {
   public getUser = async (req: Request, res: Response) => {
      const { authorization } = req.headers;

      try {
         const data = this.verifyAuth(authorization) as TJWTData;

         const { login } = data;

         const userData = await this.findUser({ login });

         if (!userData) {
            return res
               .status(HttpStatusCode.Unauthorized)
               .json({ error: 'User Not Found' });
         }

         return res
            .status(HttpStatusCode.Ok)
            .json(this.createUserResponse(userData));
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };

   public logout = async (req: Request, res: Response) => {
      const { token } = req.body;

      console.log(token);
      try {
         if (!token) {
            return res
               .status(HttpStatusCode.BadRequest)
               .json({ error: 'Refresh token is missing' });
         }

         const refreshJWT = token;

         this.verifyTokenJWT(refreshJWT) as TJWTData;

         return res.status(HttpStatusCode.Ok).send('Logouted');
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
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

   public refreshTokens = async (
      req: Request<unknown, unknown, { token: string }, unknown>,
      res: Response
   ) => {
      const { token } = req.body;

      try {
         if (!token) {
            return res
               .status(HttpStatusCode.BadRequest)
               .json({ error: 'Refresh token is missing' });
         }

         const refreshJWT = token;

         const data = this.verifyTokenJWT(refreshJWT) as TJWTData;
         const { login, email } = data;

         const userData = await this.findUser({ login });

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

         return res
            .status(HttpStatusCode.Ok)
            .json(this.createUserResponse(newUserData));
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };
}
