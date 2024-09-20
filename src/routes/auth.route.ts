import express from 'express';

import controllers from '../controllers';

const router = express.Router();

router.post('/registration', controllers.registrController.registerUser);
router.post('/login', controllers.loginController.loginUser);

export default router;
