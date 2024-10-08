import express from 'express';

import authRoute from './auth.route';
import catalogRoute from './catalog.route';
import userRoute from './user.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);

router.use('/catalog', catalogRoute);

export default router;
