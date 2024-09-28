import db from '../db';
import { IUserData } from '../services/types';
import { encrypt } from '../services/utils';

export abstract class DataBaseController {
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
         const data = await db.query(query, values);
         console.log(data);
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
         console.log(data);

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

         const updatedFavorites = await this.getFavoritesDB(login);

         return updatedFavorites || [];
      } catch (error) {
         this.catchDatabaseError(error, 'Failed to set favorite data');
         throw error;
      }
   };

   protected getFavoritesDB = async (
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

   private catchDatabaseError = (error: unknown, customMessage: string) => {
      console.error(customMessage, error);
      if (error instanceof Error) {
         throw new Error(`${customMessage}: ${error.message}`);
      } else {
         throw new Error(`${customMessage}: Unknown error occurred`);
      }
   };
}
