import { Request, Response } from 'express';

import { ILoftCard, TQuerryParams } from '../services/types';
import { filterCards, loadData, paginate } from '../services/utils';
import { storagePaths } from '../services/constants';

export class CatalogController {
   public async getLofts(
      req: Request<unknown, unknown, unknown, TQuerryParams>,
      res: Response<ILoftCard[]>
   ) {
      const { type, limit = 10, page = 1, date, price } = req.query;

      const loftCards = loadData(storagePaths.LOFTS);

      const filteredCards = filterCards(
         loftCards,
         type,
         decodeURIComponent(date),
         decodeURIComponent(price)
      );

      console.log(filteredCards.length);

      const paginatedCards = paginate(filteredCards, limit, page);

      res.status(200).json(paginatedCards);
   }

   public async getItem(req: Request, res: Response) {
      const loftCards = loadData(storagePaths.LOFTS);
      const loftCard = loftCards.find((card) => card.id === req.params.id);

      if (loftCard) {
         res.json(loftCard);
      } else {
         res.status(404).send('Loft card not found.');
      }
   }
}
