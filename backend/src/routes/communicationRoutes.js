import express from 'express';
import { saveApprovedPhrase } from '../controllers/communicationsController.js';
import { saveRejectedPhrase } from '../controllers/communicationsController.js';

const router = express.Router();

router.post('/approved', saveApprovedPhrase);
router.post('/rejected', saveRejectedPhrase);

export default router;
