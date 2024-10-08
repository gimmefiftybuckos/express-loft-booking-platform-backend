import { Request, Response } from 'express';

import { ILoft, TJWTData, TQuerryParams } from '../services/types';
import { loadData } from '../services/utils';
import { StoragePaths } from '../services/constants';
import { AxiosError, HttpStatusCode } from 'axios';
import { UserController } from './user.controller';
import { v4 as uuidv4 } from 'uuid';

export class CatalogController extends UserController {
   public getLofts = async (
      req: Request<unknown, unknown, unknown, TQuerryParams>,
      res: Response<ILoft[] | { error: string }>
   ) => {
      try {
         const { type, limit = 10, page = 1, date, price } = req.query;

         const lofts = await this.getFilteredLoftsDB({
            type,
            date,
            price,
            limit,
            page,
         });

         res.status(HttpStatusCode.Ok).json(lofts);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };

   public getLoft = async (req: Request, res: Response) => {
      try {
         const { id } = req.params;

         const loft = await this.getLoftDB(id);

         return res.status(HttpStatusCode.Ok).json(loft);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };

   public getFavoritesLofts = async (req: Request, res: Response) => {
      const { authorization } = req.headers;

      try {
         const userData = this.verifyAuth(authorization) as TJWTData;

         const { login } = userData;

         const loftIds = await this.getFavoritesIdDB(login);

         console.log(loftIds);

         if (!loftIds) {
            return res.status(HttpStatusCode.Ok).json([]);
         }

         const lofts = await this.getFavoritesLoftsDB(loftIds);

         return res.status(HttpStatusCode.Ok).json(lofts);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.InternalServerError).json({
            error: axiosError.message,
         });
      }
   };

   public saveLoft_TEST = async () => {
      const loftCards = await loadData<ILoft>(StoragePaths.LOFTS);

      const promises = loftCards.map(async (loft, index) => {
         const id = uuidv4();
         const newLoft = {
            ...loft,
            id,
         };

         console.log(newLoft);

         return await this.saveLoftDB(newLoft);
      });

      await Promise.all(promises);
   };
}
