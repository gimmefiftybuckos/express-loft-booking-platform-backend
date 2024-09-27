import { Pool } from 'pg';

const pool = new Pool({
   user: 'postgres',
   host: 'localhost',
   database: 'loft_radar',
   password: 'root',
   port: 5432,
});

export default pool;
