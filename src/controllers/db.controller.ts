import db from '../db';
import { IComments, ILoft, ILoftInit, IUserData } from '../services/types';
import { decrypt, encrypt } from '../services/utils';

export abstract class DataBaseController {
   private catchDatabaseError = (error: unknown, customMessage: string) => {
      console.error(customMessage, error);
      if (error instanceof Error) {
         throw new Error(`${customMessage}: ${error.message}`);
      } else {
         throw new Error(`${customMessage}: Unknown error occurred`);
      }
   };

   /*
      User Auth
   */
   protected saveUserDB = async (user: IUserData) => {
      const { id, email, login, password, registrTime } = user;

      const values = [id, email, login, password, registrTime];

      const query = `
         INSERT INTO users (user_id, email, login, password, registr_time) 
         values ($1, $2, $3, $4, $5) RETURNING *;
      `;

      try {
         await db.query(query, values);
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving user data:');
         throw error;
      }
   };

   protected getUserDB = async (data: {
      login: string;
      email?: string;
   }): Promise<IUserData> => {
      const id = encrypt(data.login);

      const query = `
        SELECT * FROM users 
        WHERE user_id = $1 OR email = $2;
      `;

      const values = [id, data.email];

      try {
         const data = await db.query<IUserData>(query, values);
         return data.rows[0];
      } catch (error) {
         this.catchDatabaseError(error, 'Error getting user data:');
         throw error;
      }
   };

   protected saveTokenDB = async (login: string, refreshToken: string) => {
      const id = encrypt(login);

      const values = [id, refreshToken];

      const query = `
         INSERT INTO tokens (user_id, refresh_token)
         VALUES ($1, $2)
         ON CONFLICT (user_id) 
         DO UPDATE SET refresh_token = EXCLUDED.refresh_token
         RETURNING *;
      `;

      try {
         await db.query(query, values);
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving token:');
         throw error;
      }
   };

   protected getRefreshDB = async (refreshToken: string): Promise<string> => {
      const values = [refreshToken];
      const query = `
         SELECT user_id FROM tokens 
         WHERE refresh_token = $1;
      `;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            throw new Error('Token is invalid');
         }
         return data.rows[0].user_id;
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get user data');
         throw error;
      }
   };

   protected setFavoriteDB = async (
      loftId: string,
      login: string
   ): Promise<string[]> => {
      const userId = encrypt(login);

      try {
         const values = [userId, loftId];

         const query = `
            WITH deleted AS (
               DELETE FROM favorites
               WHERE user_id = $1 AND loft_id = $2
               RETURNING *
            )
            INSERT INTO favorites (user_id, loft_id)
            SELECT $1, $2
            WHERE NOT EXISTS (
               SELECT 1 FROM deleted
            )
            RETURNING loft_id
         `;

         await db.query(query, values);

         const updatedFavorites = await this.getFavoritesIdDB(login);

         return updatedFavorites || [];
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to set favorite data');
         throw error;
      }
   };

   /*
      Lofts
      Favorites
   */

   protected getFavoritesIdDB = async (
      login: string
   ): Promise<string[] | null> => {
      const id = encrypt(login);
      const values = [id];
      const query = `
         SELECT loft_id FROM favorites 
         WHERE user_id = $1;
      `;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            return null;
         }

         return data.rows.map((row) => row.loft_id);
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get favorites loft data');
         throw error;
      }
   };

   protected getFavoritesLoftsDB = async (
      loftIds: string[]
   ): Promise<ILoft[]> => {
      const query = `
         SELECT 
            l.loft_id AS id,
            l.title,
            'description' AS "description",
            l.metro AS "metroStation",
            l.walk AS "walkingDistanceMinutes",
            l.price AS "pricePerHour",
            l.persons AS "maxPersons",
            l.places AS "seatingPlaces",
            l.area,
            l.date,
            ARRAY_AGG(DISTINCT li.image_url) AS "imageUrl",
            ARRAY_AGG(DISTINCT lt.type) AS "type",
            ARRAY_AGG(DISTINCT lr.rule) AS "rules",
            ARRAY_AGG(DISTINCT lbd.booking_date) AS "bookingDates",
            COALESCE(AVG(lc.rating)::DECIMAL, 0) AS "averageRating",  
            (SELECT COUNT(*) FROM loft_comments WHERE loft_id = l.loft_id)::INT AS "reviewsCount"                   
         FROM lofts l
         LEFT JOIN loft_images li ON l.loft_id = li.loft_id
         LEFT JOIN loft_description ld ON l.loft_id = ld.loft_id
         LEFT JOIN loft_types lt ON l.loft_id = lt.loft_id
         LEFT JOIN loft_rules lr ON l.loft_id = lr.loft_id
         LEFT JOIN loft_booking_dates lbd ON l.loft_id = lbd.loft_id
         LEFT JOIN loft_comments lc ON l.loft_id = lc.loft_id 
         WHERE l.loft_id = ANY($1)
         GROUP BY l.loft_id, l.title, ld.loft_description, l.metro, l.walk, l.price, 
                  l.persons, l.places, l.area, l.date
         ORDER BY l.loft_id;
      `;

      const values = [loftIds];

      try {
         const result = await db.query(query, values);
         return result.rows;
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get favorites lofts');
         throw error;
      }
   };

   /*
      Lofts
      Catalog
   */

   protected saveLoftDB = async (loft: ILoft) => {
      Promise.all([
         await this.saveLoftInfoDB(loft),
         await this.saveLoftDescriptionDB(loft.id, loft.description),
         await this.saveLoftImagesDB(loft.id, loft.imageUrl),
         await this.saveLoftTypesDB(loft.id, loft.type),
         await this.saveLoftRulesDB(loft.id, loft.rules),
         await this.saveBookingDateDB(loft.id, loft.bookingDates),
      ]);
   };

   private saveLoftInfoDB = async (loft: ILoftInit) => {
      const {
         id,
         title,
         metroStation,
         walkingDistanceMinutes,
         pricePerHour,
         maxPersons,
         seatingPlaces,
         area,
      } = loft;

      const values = [
         id,
         title,
         metroStation,
         walkingDistanceMinutes,
         pricePerHour,
         maxPersons,
         seatingPlaces,
         area,
      ];

      const query = `
         INSERT INTO lofts (loft_id, title, metro, walk, price, persons, places, area) 
         values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
      `;

      try {
         await db.query(query, values);
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving main loft data:');
         throw error;
      }
   };

   private saveLoftImagesDB = async (id: string, images: string[]) => {
      const query = `
         INSERT INTO loft_images (loft_id, image_url) 
         values ($1, $2) RETURNING *;
      `;

      try {
         const promises = images.map(async (img) => {
            return await db.query(query, [id, img]);
         });

         const results = await Promise.all(promises);

         return results;
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving loft images data:');
         throw error;
      }
   };

   private saveLoftDescriptionDB = async (id: string, description: string) => {
      const query = `
         INSERT INTO loft_description (loft_id, loft_description) 
         values ($1, $2) RETURNING *;
      `;

      const values = [id, description];

      try {
         const result = await db.query(query, values);

         return result;
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving loft rules data:');
         throw error;
      }
   };

   private saveLoftTypesDB = async (id: string, types: string[]) => {
      const query = `
         INSERT INTO loft_types (loft_id, type) 
         values ($1, $2) RETURNING *;
      `;

      try {
         const promises = types.map(async (type) => {
            return await db.query(query, [id, type]);
         });

         const results = await Promise.all(promises);

         return results;
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving loft types data:');
         throw error;
      }
   };

   private saveLoftRulesDB = async (id: string, rules: string[]) => {
      const query = `
         INSERT INTO loft_rules (loft_id, rule) 
         values ($1, $2) RETURNING *;
      `;

      try {
         const promises = rules.map(async (rule) => {
            return await db.query(query, [id, rule]);
         });

         const results = await Promise.all(promises);

         return results;
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving loft rules data:');
         throw error;
      }
   };

   private saveBookingDateDB = async (id: string, dates: string | string[]) => {
      const query = `
         INSERT INTO loft_booking_dates (loft_id, booking_date) 
         VALUES ($1, $2) RETURNING *;
      `;

      try {
         if (Array.isArray(dates)) {
            const promises = dates.map(async (date) => {
               return await db.query(query, [id, date]);
            });
            const results = await Promise.all(promises);

            console.log('Multiple booking dates saved:', results);
            return results;
         } else {
            const result = await db.query(query, [id, dates]);

            console.log('Single booking date saved:', result);
            return result;
         }
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving loft booking date data:');
         throw error;
      }
   };

   protected getLoftDB = async (id: string): Promise<ILoft> => {
      const query = `
            SELECT 
               JSON_BUILD_OBJECT(
                  'id', l.loft_id,
                  'title', l.title,
                  'description', ld.loft_description,
                  'metroStation', l.metro,
                  'walkingDistanceMinutes', l.walk,
                  'pricePerHour', l.price,
                  'maxPersons', l.persons,
                  'seatingPlaces', l.places,
                  'area', l.area,
                  'date', l.date,
                  'imageUrl', ARRAY_AGG(DISTINCT li.image_url),
                  'type', ARRAY_AGG(DISTINCT lt.type),
                  'rules', ARRAY_AGG(DISTINCT lr.rule),
                  'bookingDates', ARRAY_AGG(DISTINCT lbd.booking_date),
                  'averageRating', COALESCE(AVG(lc.rating)::DECIMAL, 0),
                  'reviewsCount', (SELECT COUNT(*) FROM loft_comments WHERE loft_id = l.loft_id)::INT
               ) AS loft_data
            FROM lofts l
            LEFT JOIN loft_images li ON l.loft_id = li.loft_id
            LEFT JOIN loft_description ld ON l.loft_id = ld.loft_id
            LEFT JOIN loft_types lt ON l.loft_id = lt.loft_id
            LEFT JOIN loft_rules lr ON l.loft_id = lr.loft_id
            LEFT JOIN loft_booking_dates lbd ON l.loft_id = lbd.loft_id
            LEFT JOIN loft_comments lc ON l.loft_id = lc.loft_id
            WHERE l.loft_id = $1
            GROUP BY l.loft_id, l.title, ld.loft_description, l.metro, l.walk, l.price, 
               l.persons, l.places, l.area, l.date;
         `;

      const values = [id];

      try {
         const result = await db.query(query, values);

         return result.rows[0].loft_data;
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get loft data');
         throw error;
      }
   };

   protected getFilteredLoftsDB = async ({
      type,
      date,
      price,
      limit,
      page,
   }: {
      type: string;
      date: string;
      price: string | undefined;
      limit: number;
      page: number;
   }) => {
      let minPrice;
      let maxPrice;
      if (price) {
         const [min, max] = price.split(':');
         (minPrice = min), (maxPrice = max);
      }

      const query = `SELECT 
         l.loft_id AS id,
         l.title,
         l.metro AS "metroStation",
         l.walk AS "walkingDistanceMinutes",
         l.price AS "pricePerHour",
         l.persons AS "maxPersons",
         l.places AS "seatingPlaces",
         l.area,
         l.date,
         ARRAY_AGG(DISTINCT li.image_url) AS "imageUrl",
         ARRAY_AGG(DISTINCT lt.type) AS "type",
         ARRAY_AGG(DISTINCT lr.rule) AS "rules",
         ARRAY_AGG(DISTINCT lbd.booking_date) AS "bookingDates",
         COALESCE(AVG(lc.rating)::DECIMAL, 0) AS "averageRating",  
         (SELECT COUNT(*) FROM loft_comments WHERE loft_id = l.loft_id)::INT AS "reviewsCount"                   
      FROM lofts l
      LEFT JOIN loft_images li ON l.loft_id = li.loft_id
      LEFT JOIN loft_types lt ON l.loft_id = lt.loft_id
      LEFT JOIN loft_rules lr ON l.loft_id = lr.loft_id
      LEFT JOIN loft_booking_dates lbd ON l.loft_id = lbd.loft_id
      LEFT JOIN loft_comments lc ON l.loft_id = lc.loft_id 
      GROUP BY l.loft_id, l.title, l.metro, l.walk, l.price, 
               l.persons, l.places, l.area, l.date
      HAVING 
         ($1::TEXT IS NULL OR $1 = ANY(ARRAY_AGG(DISTINCT lt.type)))
         AND ($2::TEXT IS NULL OR $2::TEXT NOT IN (
            SELECT booking_date FROM loft_booking_dates WHERE loft_id = l.loft_id
         ))
         AND ($3::INT IS NULL OR l.price >= $3)
         AND ($4::INT IS NULL OR l.price <= $4)
      ORDER BY l.loft_id
      LIMIT $5 OFFSET $6;`; // построить получение данных через курсоры (!)

      const offset = limit * page;

      const values = [
         type || null,
         date || null,
         minPrice || null,
         maxPrice || null,
         limit,
         offset,
      ];

      try {
         const result = await db.query(query, values);
         return result.rows;
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get filtered lofts data');
         throw error;
      }
   };

   protected saveCommentDB = async ({
      loftId,
      userId,
      userRating,
      userReview,
   }: IComments) => {
      if (!loftId || !userId) {
         throw new Error('Loft or user ids is not found');
      }
      const login = decrypt(userId);

      const query = `
        INSERT INTO loft_comments (loft_id, user_id, login, comment_text, rating) 
        values ($1, $2, $3, $4, $5) 
        RETURNING 
            user_id AS "userId", 
            login, 
            comment_text AS "userReview", 
            rating AS "userRating", 
            to_char(comment_date, 'YYYY-MM-DD') AS "date";
      `;

      console.log(loftId, userId);

      const values = [loftId, userId, login, userReview, userRating];

      try {
         const data = await db.query(query, values);

         return data.rows[0];
      } catch (error) {
         this.catchDatabaseError(error, 'Error saving comment data:');
         throw error;
      }
   };

   protected checkComment = async (userId: string, loftId: string) => {
      const values = [userId, loftId];

      const query = `
         SELECT * FROM loft_comments 
         WHERE user_id = $1 AND loft_id = $2;
      `;

      try {
         const data = await db.query(query, values);

         return data.rows[0];
      } catch (error) {
         this.catchDatabaseError(error, 'Error checking comment data:');
         throw error;
      }
   };

   protected getCommentsDB = async (loftId: string) => {
      const values = [loftId];
      const query = `SELECT
            lc.user_id AS "userId",
            lc.login AS "login",
            lc.comment_text AS "userReview",
            lc.rating AS "userRating",
            lc.comment_date AS "date"
         FROM loft_comments lc
         WHERE lc.loft_id = $1;
      `;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            return [];
         }

         return data.rows.map((row) => ({
            userId: row.userId,
            login: row.login,
            userReview: row.userReview,
            userRating: row.userRating,
            date: new Date(row.date),
         }));
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get comments array data');
         throw error;
      }
   };

   /*
   Получение данных о лофте из отдельно взятых таблиц
   */

   private getLoftInfoDB = async (id: string) => {
      const values = [id];

      const query = `
            SELECT
                loft_id,
                title,
                metro,
                walk,
                price,
                persons,
                places,
                area,
                date
            FROM lofts
            WHERE loft_id = $1;
        `;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            return null;
         }

         return data.rows[0];
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get favorites loft data');
         throw error;
      }
   };

   private getLoftImagesDB = async (id: string) => {
      const values = [id];

      const query = `SELECT image_url FROM loft_images WHERE loft_id = $1;`;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            return null;
         }

         return data.rows.map((row) => row.image_url);
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get favorites loft data');
         throw error;
      }
   };

   private getLoftTypesDB = async (id: string) => {
      const values = [id];

      const query = `SELECT type FROM loft_types WHERE loft_id = $1;`;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            return null;
         }

         return data.rows.map((row) => row.type);
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get favorites loft data');
         throw error;
      }
   };

   private getLoftRulesDB = async (id: string) => {
      const values = [id];

      const query = `SELECT rule FROM loft_rules WHERE loft_id = $1;`;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            return null;
         }

         return data.rows.map((row) => row.rule);
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get favorites loft data');
         throw error;
      }
   };

   private getLoftDatesDB = async (id: string) => {
      const values = [id];

      const query = `SELECT booking_date FROM loft_booking_dates WHERE loft_id = $1;`;

      try {
         const data = await db.query(query, values);

         if (data.rows.length === 0) {
            return null;
         }

         return data.rows.map((row) => row.booking_date);
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to get favorites loft data');
         throw error;
      }
   };
}
