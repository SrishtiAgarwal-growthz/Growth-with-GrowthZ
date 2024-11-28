import express from 'express';
import communicationsRoutes from './communicationRoutes.js';
// import creativesRoutes from './creativesRoutes.js';
import reviewsRoutes from './reviewsRoutes.js';

const router = express.Router();

router.use('/reviews', reviewsRoutes);
router.use('/communications', communicationsRoutes);
// router.use('/creatives', creativesRoutes);

export default router;
