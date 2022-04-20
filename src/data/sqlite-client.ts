import path from "node:path";
import { Sequelize } from "sequelize";

const dbPath = path.resolve(__dirname, "../../sqlite/db.sqlite3");

const db = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
});

db.authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

export default db;
