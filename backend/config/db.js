/*const { Pool } = require("pg");

/*const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "expense_tracker",
  password: "624420",
  port: 5432,
});

module.exports = pool;*/

/*require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

module.exports = pool;*/


const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = pool;