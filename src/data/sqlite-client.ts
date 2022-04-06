import sqlite3 from "sqlite3";
import path from "node:path";

const dbPath = path.resolve(__dirname, "../../sqlite/db.sqlite3");

const db = new sqlite3.Database(dbPath, err => {
  if (err) {
    console.error("Failed to create sqlite database: ", err);
  } else {
    console.info("Successfully created sqlite database.")
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS
  autodeleteSettings (
    channelId TEXT NOT NULL UNIQUE,
    serverId TEXT NOT NULL,
    seconds INT NOT NULL,
    PRIMARY KEY(channelId)
  )`, err => {
    if (err) {
      console.error("Failed to create autodeleteSettings table: ", err);
    } else {
      console.info("Successfully created table autodeleteSettings");
    }
});

db.run(`
  CREATE TABLE IF NOT EXISTS
  autoforwardSettings (
    serverId TEXT NOT NULL,
    sourceId TEXT NOT NULL,
    destinationId NOT NULL,
    PRIMARY KEY(sourceId, destinationId)
  )`, err => {
    if (err) {
      console.error("Failed to create autoforwardSettings table: ", err);
    } else {
      console.info("Successfully created table autoforwardSettings");
    }
});

db.run(`
  CREATE TABLE IF NOT EXISTS
  usersLastActivity (
    userId TEXT NOT NULL,
    serverId TEXT NOT NULL,
    epoch INT NOT NULL,
    PRIMARY KEY(userId, serverId) 
  )
`, err => {
  if (err) {
    console.error("Failed to create usersLastActivity table: ", err);
  }
});

export default db;