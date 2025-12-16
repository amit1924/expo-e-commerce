import express from 'express';

import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from '../src/config/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from '../src/config/inngest.js';
dotenv.config();

const app = express();

// Clerk middleware
app.use(clerkMiddleware());

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  }),
);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use('/api/inngest', serve({ client: inngest, functions }));

// server status route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
