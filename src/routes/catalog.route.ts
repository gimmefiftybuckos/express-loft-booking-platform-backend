import express from 'express';
import path from 'path';

import { loadData, storagePaths } from '../services/utils';
import { updateData } from '../services/scaleContent';

import controllers from '../controllers';

const router = express.Router();

router.get('/catalog', controllers.catalogController.getLofts);
router.get('/catalog/:id', controllers.catalogController.getItem);

router.use(
   '/uploads',
   express.static(path.resolve(__dirname, '../../uploads'))
);

router.get('/update', (req, res) => {
   updateData();
   const loftCards = loadData(storagePaths.LOFTS);
   res.status(200).json(loftCards);
});

export default router;
