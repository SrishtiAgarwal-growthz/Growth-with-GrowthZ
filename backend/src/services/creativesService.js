// import { connectToMongo } from '../config/db.js';
// import { saveCreativeUrl } from '../models/creativesModel.js';
// import { createAdImage } from './imageProcessingService.js';

// export const generateCreative = async (email, phrases, images) => {
//   const client = await connectToMongo();
//   const db = client.db('Images');
  
//   for (const image of images) {
//     const creative = await createAdImage(image, phrases);
//     await saveCreativeUrl(db, email, creative);
//   }
// };
