const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const advisorRouter = require('./routers/advisorRouter');
const dashboardRouter = require('./routers/dashboardRouter');
const studentRouter = require('./routers/studentRouter');
const courseRouter = require('./routers/courseRouter');
const authRouter = require('./routers/authRoutes');
const testRouter = require('./routers/testRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/advisors', advisorRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/students', studentRouter);
app.use('/api/courses', courseRouter);
app.use('/api/test', testRouter); // Test routes for auth & RBAC

app.get('/', (req, res) => {
  res.send('AKAS Backend API is running');
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error('Please close the application using this port or change the PORT in .env file\n');
    process.exit(1);
  } else {
    throw err;
  }
});
