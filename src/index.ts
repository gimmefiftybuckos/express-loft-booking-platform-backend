import express from 'express';
import path from 'path';
import cors from 'cors';
import { Request, Response } from 'express';

import {
   loadData,
   filterCards,
   paginate,
   storagePaths,
} from './services/utils';
import { ILoftCard } from './services/types';
import { updateData } from './services/scaleContent';

const app = express();
app.use(express.json());

app.use(
   cors({
      origin: 'http://localhost:5173',
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
   })
);

type TQuerryParams = {
   type: string;
   limit: number;
   page: number;
   date: string;
   price: string;
};

app.get(
   '/catalog',
   (
      req: Request<unknown, unknown, unknown, TQuerryParams>,
      res: Response<ILoftCard[]>
   ) => {
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
);

app.get('/catalog/:id', (req, res) => {
   const loftCards = loadData(storagePaths.LOFTS);
   const loftCard = loftCards.find((card) => card.id === req.params.id);

   if (loftCard) {
      res.json(loftCard);
   } else {
      res.status(404).send('Loft card not found.');
   }
});

app.get('/update', (req, res) => {
   updateData();
   const loftCards = loadData(storagePaths.LOFTS);
   res.status(200).json(loftCards);
});

type TRegisterData = {
   email: string;
   login: string;
   password: string;
};

app.post(
   '/registration',
   (req: Request<unknown, unknown, TRegisterData>, res: Response) => {
      const { email, login, password } = req.body;

      res.send('User registered');
   }
);

type TLoginData = {
   login: string;
   password: string;
};

app.post(
   '/login',
   (req: Request<unknown, unknown, TLoginData>, res: Response) => {
      const { login, password } = req.body;
      console.log(login, password);
      res.send('User logined');
   }
);

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.listen(3000, () => {
   console.log('Server is running on http://localhost:3000');
});
