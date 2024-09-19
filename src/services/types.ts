import { storagePaths } from './utils';

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
