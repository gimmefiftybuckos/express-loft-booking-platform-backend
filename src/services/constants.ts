import path from 'path';

export enum TypeJWT {
   ACCESS = 'access',
   REFRESH = 'refresh',
}

export enum StoragePaths {
   LOFTS = 'loftCards.json',
   USER = 'user.json',
}

export const usersDir = path.resolve(__dirname, '../../users');
