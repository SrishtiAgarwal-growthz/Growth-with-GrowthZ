import express from 'express';
import * as communicationsController from '../controllers/communicationsController.js';

const router = express.Router();

router.post('/approved', communicationsController.saveApprovedPhrase);
router.post('/rejected', communicationsController.saveRejectedPhrase);

export default router;
