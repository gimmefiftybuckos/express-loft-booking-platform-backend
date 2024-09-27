import { StoragePaths } from './constants';

export interface ILoftCard {
   id: string;
   title: string;
   metroStation: string;
   walkingDistanceMinutes: number;
   reviewsCount: number;
   averageRating: number;
   pricePerHour: number;
   maxPersons: number;
   seatingPlaces: number;
   area: number;
   imageUrl: string[];
   type: string[];
   rules: string[];
   bookingDates: string[];
}

export type TStoragePath = StoragePaths;

export type TQuerryParams = {
   type: string;
   limit: number;
   page: number;
   date: string;
   price: string;
};

export type TLoginData = {
   login: string;
   password: string;
};

export interface IRegisterData {
   email: string;
   login: string;
   password: string;
}

export interface IUserData extends IRegisterData {
   id: string;
   registrTime: Date;
   accessToken: string;
   refreshToken: string;
}

export type TUserResponse = {
   accessToken: string;
   refreshToken: string;
   user: {
      email: string;
      login: string;
   };
};

export type TJWTData = {
   email: string;
   login: string;
   type: string;
   iat: number;
   exp: number;
};

export type TFavoritesData = {
   id: string;
   title: string;
};

export type TTokens = {
   accessToken: string;
   refreshToken: string;
};
