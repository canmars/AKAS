const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const advisorRouter = require('./routers/advisorRouter');
const dashboardRouter = require('./routers/dashboardRouter');

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
app.use('/api/advisors', advisorRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/', (req, res) => {
  res.send('AKAS Backend API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
