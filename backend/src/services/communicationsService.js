import { connectToMongo } from '../config/db.js';
import { savePhraseToDatabase } from '../models/communicationsModel.js';

export const saveApprovedPhraseInDb = async (email, phrase) => {
    const client = await connectToMongo();
    const db = client.db('Communications');
    await savePhraseToDatabase(db, 'approvedCommunication', email, phrase);
};

export const saveRejectedPhraseInDb = async (email, phrase) => {
    const client = await connectToMongo();
    const db = client.db('Communications');
    await savePhraseToDatabase(db, 'rejectedCommunication', email, phrase);
};
