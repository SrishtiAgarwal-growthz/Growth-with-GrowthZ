import { MongoClient } from "mongodb";

export const connectToMongo = async () => {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB!')
    return client;
}