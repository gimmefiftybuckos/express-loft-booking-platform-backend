import { StoragePaths } from './constants';

export interface ILoftInit {
   id: string;
   title: string;
   description: string;
   metroStation: string;
   walkingDistanceMinutes: number;
   pricePerHour: number;
   maxPersons: number;
   seatingPlaces: number;
   area: number;
   type: string[];
   rules: string[];
   date: Date;
}

export interface ILoft extends ILoftInit {
   imageUrl: string[];
   reviewsCount: number;
   averageRating: string;
   bookingDates: string[];
}

export interface IComments {
   loftId: string;
   userId?: string;
   userReview: string;
   userRating: number;
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
