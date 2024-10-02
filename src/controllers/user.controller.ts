import { AxiosError, HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

import { AuthController } from './auth.controller';
import { TJWTData } from '../services/types';
import { decrypt } from '../services/utils';

export class UserController extends AuthController {
   public authUser = async (req: Request, res: Response) => {
      const { authorization, 'user-agent': user } = req.headers;

      console.log(user);

      try {
         const data = this.verifyAuth(authorization) as TJWTData;

         const { login } = data;

         const userData = await this.getUserDB({ login });

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

      try {
         if (!token) {
            return res
               .status(HttpStatusCode.BadRequest)
               .json({ error: 'Refresh token is missing' });
         }

         const refreshJWT = token;

         const id = await this.getRefreshDB(refreshJWT);
         const login = decrypt(id);
         await this.saveTokenDB(login, '');

         return res.status(HttpStatusCode.Ok).send('Logouted');
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
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

         const id = await this.getRefreshDB(refreshJWT);
         const login = decrypt(id);
         const user = await this.getUserDB({ login });

         const { email } = user;

         if (!user) {
            return res
               .status(HttpStatusCode.Unauthorized)
               .json({ error: 'User Not Found' });
         }

         const { accessToken, refreshToken } = this.createTokens(email, login);

         await this.saveTokenDB(login, refreshToken);

         const newUser = {
            ...user,
            accessToken,
            refreshToken,
         };

         return res
            .status(HttpStatusCode.Ok)
            .json(this.createUserResponse(newUser));
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };

   public setFavorite = async (req: Request, res: Response) => {
      const { authorization } = req.headers;

      const { loftId } = req.body;

      try {
         if (!loftId) {
            throw new Error('ID Not Found');
         }

         const userData = this.verifyAuth(authorization) as TJWTData;

         const { login } = userData;

         const data = await this.setFavoriteDB(loftId, login);

         return res.status(HttpStatusCode.Ok).json(data);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };

   public getFavorites = async (req: Request, res: Response) => {
      const { authorization } = req.headers;

      try {
         const userData = this.verifyAuth(authorization) as TJWTData;

         const { login } = userData;

         const data = await this.getFavoritesDB(login);

         return res.status(HttpStatusCode.Ok).json(data);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };
}
