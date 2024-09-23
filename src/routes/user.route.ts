import express from 'express';

import controllers from '../controllers';

const router = express.Router();

router.post('/refresh', controllers.userController.refreshTokens);

export default router;
