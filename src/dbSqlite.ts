import { DatabaseSync } from 'node:sqlite'

const dbSqlite = new DatabaseSync(':memory:')

dbSqlite.exec(`
  CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
  )`)

dbSqlite.exec(`
  CREATE TABLE todo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  text TEXT,
  complete BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
  )`)

export default dbSqlite
