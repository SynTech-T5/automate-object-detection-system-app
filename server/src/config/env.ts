import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env.local') });

export const env = {
    PORT: Number(process.env.PORT),
    PGHOST: process.env.DATABASE_HOST,
    PGPORT: Number(process.env.POSTGRES_PORT),
    PGDATABASE: process.env.POSTGRES_DB,
    PGUSER: process.env.POSTGRES_USER,
    PGPASSWORD: process.env.POSTGRES_PASSWORD,
};