import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

type TRegisterData = {
   email: string;
   login: string;
   password: string;
};

type TUserData = {
   userId: string;
   registrData: TRegisterData;
   registrTime: Date;
   accesToken: string;
   refreshToken: string;
};

type TLoginData = {
   login: string;
   password: string;
};

export class AuthController {
   public async registrUser(
      req: Request<unknown, unknown, TRegisterData>,
      res: Response
   ) {
      const { email, login, password } = req.body;
      const token = uuidv4();

      const userData: TUserData = {
         userId: token,
         registrData: {
            email: email,
            login: login,
            password: password,
         },
         registrTime: new Date(),
         accesToken: 'test',
         refreshToken: 'testtest',
      };

      console.log(token);

      console.log(userData);

      res.send('User registered');
   }

   public async loginUser(
      req: Request<unknown, unknown, TLoginData>,
      res: Response
   ) {
      const { login, password } = req.body;
      console.log(login, password);
      res.send('User logined');
   }
}
