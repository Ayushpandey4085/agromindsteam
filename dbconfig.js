import pg from "pg";
import dotenv from "dotenv";
dotenv.config();



const db= new pg.Client({
    user:process.env.DATABASE_USER_NAME,
    host:process.env.DATABASE_HOST,
    database:process.env.DATABASE_NAME,
    password:process.env.DATABASE_PASSWORD,
    port:process.env.DATABASE_PORT
})

db.connect();

export default db;