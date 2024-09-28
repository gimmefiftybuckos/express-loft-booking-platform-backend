import { Pool } from 'pg';

const user = process.env.DB_USER || 'postgres';
const host = process.env.DB_HOST || 'localhost';
const db = process.env.DB_DATABASE || 'loft_radar';
const password = process.env.DB_PASSWORD || 'root';
const port = process.env.DB_PORT || 5432;

const pool = new Pool({
   user: user,
   host: host,
   database: db,
   password: password,
   port: +port,
});

export default pool;
