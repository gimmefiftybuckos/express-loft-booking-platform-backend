import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

import {
   saveLoftCards,
   loadLoftCards,
   shuffleArray,
   filterCards,
   paginate,
} from './utils.js';

const app = express();
app.use(express.json());

app.use(
   cors({
      origin: 'http://localhost:5173',
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
   })
);

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/');
   },
   filename: function (req, file, cb) {
      cb(null, uuidv4() + path.extname(file.originalname));
   },
});

const upload = multer({ storage: storage });

app.post('/catalog', upload.single('image'), (req, res) => {
   const {
      title,
      metroStation,
      walkingDistanceMinutes,
      reviewsCount,
      averageRating,
      pricePerHour,
      maxPersons,
      seatingPlaces,
      area,
      type,
   } = req.body;

   if (!req.file) {
      return res.status(400).send('Image file is required.');
   }

   const newCard = {
      id: uuidv4(),
      title,
      metroStation,
      walkingDistanceMinutes: parseInt(walkingDistanceMinutes),
      reviewsCount: parseInt(reviewsCount),
      averageRating: parseFloat(averageRating),
      pricePerHour: parseFloat(pricePerHour),
      maxPersons: parseInt(maxPersons),
      seatingPlaces: parseInt(seatingPlaces),
      area: parseFloat(area),
      imageUrl: `${req.file.filename}`,
      type: type,
   };

   const loftCards = loadLoftCards();

   loftCards.push(newCard);

   saveLoftCards(loftCards);

   res.status(201).json(newCard);
});

app.get('/catalog', (req, res) => {
   const { filter, limit = 10, page = 1 } = req.query;

   const loftCards = loadLoftCards();

   const filteredCards = filter ? filterCards(loftCards, filter) : loftCards;
   // const shuffledCards = shuffleArray(filteredCards);

   const paginatedCards = paginate(filteredCards, limit, page);

   res.status(200).json(paginatedCards);
});

app.get('/catalog/:id', (req, res) => {
   const loftCards = loadLoftCards();
   const loftCard = loftCards.find((card) => card.id === req.params.id);
   if (loftCard) {
      res.json(loftCard);
   } else {
      res.status(404).send('Loft card not found.');
   }
});

app.use('/uploads', express.static('uploads'));

app.listen(3000, () => {
   console.log('Server is running on http://localhost:3000');
});
