# Metadata Service

A microservice for mini-Careem that owns and serves shared metadata (e.g., fare rates, peak factors) using a cache-aside pattern.

## Stack Justification
This service is built using Node.js and Express, backed by Redis for caching. Node.js is inherently non-blocking and excels at handling I/O-heavy, read-intensive API tasks. Given that metadata like surge multipliers and base fares must be fetched with extremely low latency during rush hours, the Express + `ioredis` combination ensures maximum throughput. The service employs a cache-aside pattern: it defaults to Redis for fast reads but gracefully degrades to its own local data store if the cache is missing or the Redis cluster is unreachable, fully respecting the microservice boundary of owning its own data.

## Running Locally
bash
npm install
npm start
## Testing
Tests are written using Jest and Supertest, with Redis fully mocked to run independently of the database infrastructure.
bash
npm test