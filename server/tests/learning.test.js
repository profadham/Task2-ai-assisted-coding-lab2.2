import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { Rating } from '../src/models/Rating.js';
import { User } from '../src/models/User.js';

describe('Learning Example: Rating Summary', () => {

  // SETUP: This runs before the tests
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI);
  });

  // CLEANUP: This runs after each test to ensure a clean slate
  afterEach(async () => {
    await Rating.deleteMany({});
    await User.deleteMany({});
  });

  // TEARDOWN: Disconnect from DB after all tests in this block
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should calculate the average rating correctly for a movie', async () => {
    // 1. ARRANGE
    // We create 3 ratings for movie "MV101" with values 3, 4, and 5.
    // The average should be (3+4+5)/3 = 4.
    await Rating.create([
      { movieCode: 'MV101', rating: 3 },
      { movieCode: 'MV101', rating: 4 },
      { movieCode: 'MV101', rating: 5 },
    ]);

    // 2. ACT
    // We call the summary endpoint for MV101
    const response = await request(app).get('/api/ratings/summary?movieCode=MV101');

    // 3. ASSERT
    // Check if the status is 200
    expect(response.status).toBe(200);
    // Check if the data matches our math
    expect(response.body).toEqual({
      movieCode: 'MV101',
      averageRating: 4,
      ratingCount: 3
    });
  });

  it('should return 0s if the movie has no ratings', async () => {
    // ACT
    const response = await request(app).get('/api/ratings/summary?movieCode=EMPTY_MOVIE');

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      movieCode: 'EMPTY_MOVIE',
      averageRating: 0,
      ratingCount: 0
    });
  });
});
