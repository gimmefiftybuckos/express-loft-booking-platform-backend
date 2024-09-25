import express from 'express';

import controllers from '../controllers';

const router = express.Router();

router.post('/refresh', controllers.userController.refreshTokens);
router.get('/auth', controllers.userController.getUser);
router.post('/logout', controllers.userController.logout);

export default router;
