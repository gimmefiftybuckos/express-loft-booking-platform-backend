import express from 'express';

import authRoute from './auth.route';
import catalogRoute from './catalog.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use(catalogRoute);

export default router;
