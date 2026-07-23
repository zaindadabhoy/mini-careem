// Mock Redis globally BEFORE importing the app
jest.mock('ioredis', () => require('ioredis-mock'));

const request = require('supertest');
const app = require('./index');
const Redis = require('ioredis');

// Create a mock redis instance to interact with it during tests
const redis = new Redis();

describe('Metadata Service API', () => {
  beforeEach(async () => {
    // Clear mock redis before each test
    await redis.flushall();
  });

  it('should serve from database and update cache on Cache MISS', async () => {
    const response = await request(app).get('/api/metadata');
    
    expect(response.status).toBe(200);
    expect(response.body.source).toBe('database');
    expect(response.body.data.baseFare).toBe(100);

    // Verify Redis was updated
    const cached = await redis.get('metadata_rates');
    expect(cached).toBeDefined();
  });

  it('should serve from redis on Cache HIT', async () => {
    // Pre-populate mock redis
    const mockData = { baseFare: 150, perKmRate: 25, peakFactor: 2.0 };
    await redis.set('metadata_rates', JSON.stringify(mockData));

    const response = await request(app).get('/api/metadata');
    
    expect(response.status).toBe(200);
    expect(response.body.source).toBe('redis-cache');
    expect(response.body.data.baseFare).toBe(150);
  });

  it('should return 200 OK for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});