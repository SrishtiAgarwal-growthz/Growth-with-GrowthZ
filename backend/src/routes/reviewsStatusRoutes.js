import express from 'express';
import { saveApprovedPhrase, saveRejectedPhrase } from '../controllers/reviewsStatusController.js';

const router = express.Router();

router.post('/approved', saveApprovedPhrase);
router.post('/rejected', saveRejectedPhrase);

export default router;
