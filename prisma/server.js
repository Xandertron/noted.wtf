import { PrismaClient } from '@prisma/client'

let db;

//check if there is already a connection to the database
if (!global.db) {
  global.db = new PrismaClient()
}
db = global.db

export { db };