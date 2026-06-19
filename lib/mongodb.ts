import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
  mongoClientPromise: Promise<MongoClient> | undefined;
};

function getMongoUri(): string {
  const uri = process.env.DATABASE_URL ?? process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing DATABASE_URL or MONGODB_URI environment variable.",
    );
  }
  return uri;
}

function createClient(): MongoClient {
  return new MongoClient(getMongoUri(), {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 60_000,
  });
}

export async function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "production") {
    if (!globalForMongo.mongoClientPromise) {
      const client = createClient();
      globalForMongo.mongoClientPromise = client.connect();
    }
    return globalForMongo.mongoClientPromise;
  }

  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = createClient();
    await globalForMongo.mongoClient.connect();
  }

  return globalForMongo.mongoClient;
}

export async function getDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function pingMongo(): Promise<boolean> {
  try {
    const client = await getMongoClient();
    await client.db().admin().ping();
    return true;
  } catch {
    return false;
  }
}

export async function disconnectMongo(): Promise<void> {
  if (globalForMongo.mongoClient) {
    await globalForMongo.mongoClient.close();
    globalForMongo.mongoClient = undefined;
  }
  if (globalForMongo.mongoClientPromise) {
    const client = await globalForMongo.mongoClientPromise;
    await client.close();
    globalForMongo.mongoClientPromise = undefined;
  }
}
