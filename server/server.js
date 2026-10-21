const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

// ── B11: Fail fast if JWT_SECRET is missing or still the placeholder ──────────
const PLACEHOLDER = 'REPLACE_ME_WITH_A_STRONG_RANDOM_SECRET_AT_LEAST_64_CHARS';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === PLACEHOLDER) {
  console.error(
    '\n[FATAL] JWT_SECRET is not set or is still the placeholder value.\n' +
    'Generate a real secret and set it in server/.env before starting.\n' +
    '  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n'
  );
  process.exit(1);
}

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CWMS API is running',
        database: 'MongoDB connected'
    });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/waste', require('./routes/wasteRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/pickups', require('./routes/pickupRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
