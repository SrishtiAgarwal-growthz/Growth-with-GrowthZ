import { connectToMongo } from '../config/db.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const client = await connectToMongo();
const db = client.db('Communications');

export const saveApprovedPhraseInDb = async (email, phrase) => {
    try {
        const collection = db.collection('approvedCommunication');
        await collection.updateOne(
            { email },
            { $push: { phrases: phrase } },
            { upsert: true }
        );
        console.log(`Phrase saved to ${collection} for email: ${email}`);
    } catch (error) {
        console.error(`Error saving phrase to ${collection}:`, error);
        throw error;
    }
};

export const saveRejectedPhraseInDb = async (email, phrase) => {
    try {
        const collection = db.collection('rejectedCommunication');
        await collection.updateOne(
            { email },
            { $push: { phrases: phrase } },
            { upsert: true }
        );
        console.log(`Phrase saved to ${collection} for email: ${email}`);
    } catch (error) {
        console.error(`Error saving phrase to ${collection}:`, error);
        throw error;
    }
};

// Fetch all phrases for an email from the database
export const fetchPhrasesByEmail = async (email) => {
    try {
        const collection = db.collection('approvedCommunication');
        const result = await collection.findOne({ email });
        if (result && result.phrases) {
            console.log(`Phrases fetched for email: ${email}`);
            return result.phrases;
        } else {
            console.log(`No phrases found for email: ${email}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching phrases from ${collection}:`, error);
        throw error;
    }
};

// Delete a phrase for a specific email
export const deletePhraseByEmail = async (email, phrase) => {
    try {
        const collection = db.collection('approvedCommunication');
        const result = await collection.updateOne(
            { email },
            { $pull: { phrases: phrase } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Phrase deleted from ${collection} for email: ${email}`);
        } else {
            console.log(`Phrase not found for email: ${email}`);
        }
    } catch (error) {
        console.error(`Error deleting phrase from ${collection}:`, error);
        throw error;
    }
};

// Fetch all records from a collection
export const fetchAllFromCollection = async () => {
    try {
        const collection = db.collection('approvedCommunication');
        const result = await collection.find({}).toArray();
        console.log(`Fetched all records from ${collection}`);
        return result;
    } catch (error) {
        console.error(`Error fetching all records from ${collection}:`, error);
        throw error;
    }
};
