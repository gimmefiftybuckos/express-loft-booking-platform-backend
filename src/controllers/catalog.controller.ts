import { Request, Response } from 'express';

import { ILoftCard, TQuerryParams } from '../services/types';
import { filterCards, loadData, paginate } from '../services/utils';
import { StoragePaths } from '../services/constants';
import { AxiosError, HttpStatusCode } from 'axios';
import { UserController } from './user.controller';

export class CatalogController extends UserController {
   public getLofts = async (
      req: Request<unknown, unknown, unknown, TQuerryParams>,
      res: Response<ILoftCard[] | { error: string }>
   ) => {
      try {
         const { type, limit = 10, page = 1, date, price } = req.query;

         const loftCards = await loadData<ILoftCard>(StoragePaths.LOFTS);

         const filteredCards = filterCards(
            loftCards,
            type,
            decodeURIComponent(date),
            decodeURIComponent(price)
         );

         console.log(filteredCards.length);

         const paginatedCards = paginate(filteredCards, limit, page);

         res.status(HttpStatusCode.Ok).json(paginatedCards);
      } catch (error) {
         console.error(error);
         const axiosError = error as AxiosError;
         return res.status(HttpStatusCode.Unauthorized).json({
            error: axiosError.message,
         });
      }
   };

   public getItem = async (req: Request, res: Response) => {
      const loftCards = await loadData<ILoftCard>(StoragePaths.LOFTS);
      const loftCard = loftCards.find((card) => card.id === req.params.id);

      if (loftCard) {
         res.json(loftCard);
      } else {
         res.status(HttpStatusCode.NotFound).json({
            error: 'Loft Not Found',
         });
      }
   };
}
