import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Security & Cross-Origin Configuration
const getAllowedOrigins = () => {
  const envOrigins = process.env.CLIENT_URL;
  if (!envOrigins) return ['http://localhost:5173'];
  return envOrigins.split(',').map((o) => o.trim()).filter(Boolean);
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, uptime monitors, or server-to-server)
      if (!origin) return callback(null, true);
      const allowed = getAllowedOrigins();
      if (allowed.includes(origin) || allowed.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true
  })
);

// Request Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Primary API Router
app.use('/api', routes);

// Root Health Fallback
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload in request body.'
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    console.error('[Unhandled Server Error]:', err);
  }

  return res.status(statusCode).json({
    status: 'error',
    message: isProduction && statusCode === 500 ? 'Internal Server Error' : (err.message || 'Internal Server Error')
  });
});

export default app;
