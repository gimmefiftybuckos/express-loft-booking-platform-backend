import { storagePaths } from './constants';

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

export type TStoragePath = storagePaths;

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

export type TRegisterData = {
   email: string;
   login: string;
   password: string;
};

export type TUserData = {
   userId: string;
   registrData: TRegisterData;
   registrTime: Date;
   accessToken: string;
   refreshToken: string;
};

export type TUserResponse = {
   accessToken: string;
   refreshToken: string;
   user: {
      email: string;
      login: string;
   };
};
