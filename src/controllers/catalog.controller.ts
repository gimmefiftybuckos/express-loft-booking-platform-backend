import { Request, Response } from 'express';

import { IComments, ILoft, TJWTData, TQuerryParams } from '../services/types';
import { encrypt, loadData } from '../services/utils';
import { StoragePaths } from '../services/constants';
import { AxiosError, HttpStatusCode } from 'axios';
import { UserController } from './user.controller';
import { v4 as uuidv4 } from 'uuid';

export class CatalogController extends UserController {
   public INITAL_LOAD_CATALOG = async () => {
      const loftCards = await loadData<ILoft>(StoragePaths.LOFTS);

      const promises = loftCards.map(async (loft) => {
         const id = uuidv4();
         const newLoft = {
            ...loft,
            id,
         };

         return await this.saveLoftDB(newLoft);
      });

      await Promise.all(promises);
   };

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

   public saveComment = async (
      req: Request<unknown, unknown, IComments, unknown>,
      res: Response
   ) => {
      const { loftId, userRating, userReview } = req.body;

      const { authorization } = req.headers;

      try {
         const userData = this.verifyAuth(authorization) as TJWTData;
         const { login } = userData;
         const userId = encrypt(login);

         const isExist = await this.checkComment(userId, loftId);

         if (isExist) {
            throw new Error('Comment is exist');
         }

         const data = await this.saveCommentDB({
            loftId,
            userId,
            userRating,
            userReview,
         });

         return res.status(HttpStatusCode.Ok).json(data);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.InternalServerError).json({
            error: axiosError.message,
         });
      }
   };

   public getComments = async (
      req: Request<{ loftId: string }, unknown, unknown, unknown>,
      res: Response
   ) => {
      const { loftId } = req.params;

      try {
         const data = await this.getCommentsDB(loftId);

         return res.status(HttpStatusCode.Ok).json(data);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.InternalServerError).json({
            error: axiosError.message,
         });
      }
   };
}

const test = new CatalogController();

test.INITAL_LOAD_CATALOG();
