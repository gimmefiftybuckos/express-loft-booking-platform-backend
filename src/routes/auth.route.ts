import express from 'express';

import controllers from '../controllers';

const router = express.Router();

router.post('/registration', controllers.authController.registrUser);
router.post('/login', controllers.authController.loginUser);

export default router;
