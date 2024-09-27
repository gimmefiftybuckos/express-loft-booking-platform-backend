import express from 'express';

import controllers from '../controllers';

const router = express.Router();

router.post('/refresh', controllers.userController.refreshTokens);
router.get('/auth', controllers.userController.authUser);
router.post('/logout', controllers.userController.logout);

router.post('/favorite', controllers.userController.setFavorite);
router.get('/favorite', controllers.userController.getFavorites);

export default router;
