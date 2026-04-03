const express = require('express');
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Public Routes
app.use('/auth', proxy(process.env.USER_SERVICE_URL));

// Protected Routes
app.use('/policies', authenticate, proxy(process.env.POLICY_SERVICE_URL));
app.use('/claims', authenticate, proxy(process.env.CLAIMS_SERVICE_URL));
app.use('/payouts', authenticate, proxy(process.env.PAYOUT_SERVICE_URL));
app.use('/user', authenticate, proxy(process.env.USER_SERVICE_URL));

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
