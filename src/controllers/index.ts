import { CatalogController } from './catalog.controller';
import { LoginController } from './login.controller';
import { RegistrController } from './registration.controller';

export default {
   registrController: new RegistrController(),
   catalogController: new CatalogController(),
   loginController: new LoginController(),
};
