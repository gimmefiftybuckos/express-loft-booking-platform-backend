import { AuthController } from './auth.controller';
import { CatalogController } from './catalog.controller';

export default {
   authController: new AuthController(),
   catalogController: new CatalogController(),
};
