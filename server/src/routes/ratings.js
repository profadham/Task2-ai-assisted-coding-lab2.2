import express from 'express';
import {
  createRating,
  getAllRatings,
  getRating,
  getRatingSummary
} from '../controllers/ratingController.js';

const router = express.Router();

// GET /api/ratings/summary
router.get('/summary', getRatingSummary);

// POST /api/ratings
router.post('/', createRating);

// GET /api/ratings
router.get('/', getAllRatings);

// GET /api/ratings/:id
router.get('/:id', getRating);

export default router;
