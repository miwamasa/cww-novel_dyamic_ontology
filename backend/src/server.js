/**
 * Dynamic Ontology Backend Server
 *
 * Provides API endpoints for ontology operations using LLM
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ontologyRouter from './routes/ontology.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', ontologyRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║  Dynamic Ontology Backend Server                  ║
╠════════════════════════════════════════════════════╣
║  Status: Running                                   ║
║  Port: ${PORT.toString().padEnd(45)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(37)}║
║  LLM Provider: ${(process.env.LLM_PROVIDER || 'not configured').padEnd(34)}║
╠════════════════════════════════════════════════════╣
║  Available Endpoints:                              ║
║  - GET  /health                                    ║
║  - GET  /api/operations                            ║
║  - GET  /api/examples                              ║
║  - POST /api/validate                              ║
║  - POST /api/convert/to-turtle                     ║
║  - POST /api/execute/:operation                    ║
║  - POST /api/test-llm                              ║
╠════════════════════════════════════════════════════╣
║  Operations supported:                             ║
║  - addition      (disjoint union)                  ║
║  - subtraction   (set difference)                  ║
║  - merge         (alignment-based union)           ║
║  - composition   (interface-based connection)      ║
║  - division      (inverse/decomposition)           ║
╚════════════════════════════════════════════════════╝
  `);

  if (!process.env.LLM_API_KEY) {
    console.log(`
⚠️  WARNING: No LLM API key configured
   The server will run in MOCK mode with simulated responses.
   To use real LLM capabilities, set LLM_API_KEY in .env file.
    `);
  }
});

export default app;
