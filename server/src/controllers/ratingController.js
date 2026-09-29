import Joi from 'joi';
import { Rating } from '../models/Rating.js';

const createSchema = Joi.object({
  movieCode: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  note: Joi.string().optional(),
  ratedBy: Joi.string().optional()
});

// POST /api/ratings
export async function createRating(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const rating = await Rating.create(value);
    res.status(201).json({ rating });
  } catch (err) {
    // Handle MongoDB duplicate key error for the compound index
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User has already rated this movie' });
    }
    next(err);
  }
}

// GET /api/ratings
export async function getAllRatings(req, res, next) {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 }).lean();
    res.json({ ratings });
  } catch (err) {
    next(err);
  }
}

// GET /api/ratings/:id
export async function getRating(req, res, next) {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    res.json({ rating });
  } catch (err) {
    next(err);
  }
}

// GET /api/ratings/summary?movieCode=MV101
export async function getRatingSummary(req, res, next) {
  try {
    const { movieCode } = req.query;
    if (!movieCode) {
      return res.status(400).json({ message: 'movieCode is required' });
    }

    const summary = await Rating.aggregate([
      { $match: { movieCode: movieCode } },
      {
        $group: {
          _id: '$movieCode',
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.json({
        movieCode: movieCode,
        averageRating: 0,
        ratingCount: 0
      });
    }

    const result = summary[0];
    res.json({
      movieCode: result._id,
      averageRating: result.averageRating,
      ratingCount: result.ratingCount
    });
  } catch (err) {
    next(err);
  }
}
