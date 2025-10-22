import { Db, ObjectId } from "mongodb";
const { MongoClient } = require("mongodb");

const url = process.env.CONNECTION_STRING as string;

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let connection: Db;

async function connect() {
  try {
    if (!connection) {
      await client.connect();
      connection = client.db("dogni");
      // console.log('connect');
      return connection;
    }
    return connection;
  } catch (error) {
    throw error;
  }
}

async function createSession() {
  try {
    return await client.startSession();
  } catch (error) {
    throw error;
  }
}

function getMongoId(documentId: string) {
  try {
    return new ObjectId(documentId);
  } catch (error) { }
}

export { connect, getMongoId, createSession };