import { CatalogController } from './catalog.controller';
import { LoginController } from './login.controller';
import { RegistrController } from './registration.controller';
import { UserController } from './user.controller';

export default {
   registrController: new RegistrController(),
   catalogController: new CatalogController(),
   loginController: new LoginController(),
   userController: new UserController(),
};
