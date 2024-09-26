import path from 'path';

export enum TypeJWT {
   ACCESS = 'access',
   REFRESH = 'refresh',
}

export enum StoragePaths {
   LOFTS = 'catalog.json',
   USER = 'user.json',
   FAVORITES = 'favorites.json',
}

export const usersDir = path.resolve(__dirname, '../../users');
