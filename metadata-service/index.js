const express = require('express');
const Redis = require('ioredis');

const app = express();
// Use port 8084 since existing services use 8081, 8082, and 8083
const PORT = process.env.PORT || 8084;

// Initialize Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  // Fail fast: do not attempt to reconnect indefinitely if Redis is down
  retryStrategy: () => null 
});

// Catch and silence the connection error event to prevent terminal crashes.
// The actual routing logic handles the fallback gracefully in the try/catch block.
redis.on('error', (err) => {
    // Silently ignore connection errors here
});

// Simulated database fallback (Assignment constraint: Service owns its data)
const dbFallback = {
  baseFare: 100,
  perKmRate: 20,
  peakFactor: 1.5
};

app.get('/api/metadata', async (req, res) => {
  try {
    // 1. Attempt to fetch data from Redis (RAM)
    const cachedData = await redis.get('metadata_rates');
    
    if (cachedData) {
      // Cache HIT: Return fast response from Redis
      return res.json({ source: 'redis-cache', data: JSON.parse(cachedData) });
    }

    // 2. Cache MISS: Fetch from database, update Redis with a TTL, and return
    await redis.set('metadata_rates', JSON.stringify(dbFallback), 'EX', 60); // 60 seconds expiry
    return res.json({ source: 'database', data: dbFallback });

  } catch (error) {
    // 3. GRACEFUL DEGRADATION: If Redis is completely down, serve from the database
    console.warn('Redis is unreachable! Serving from database fallback.');
    return res.json({ source: 'database-fallback', data: dbFallback });
  }
});

// Health check route required for the API Gateway and Docker
app.get('/health', (req, res) => res.send('OK'));

// Only start the server if this file is run directly (not during testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Metadata service running on port ${PORT}`);
  });
}

// Export the app for testing purposes
module.exports = app;