const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/auth/User');
const { authenticate } = require('./auth');

/**
 * Middleware to check for Geo-Login anomalies
 * In a real production environment, we'd use a service like MaxMind or ipapi
 */
const geoLoginCheck = async (req, res, next) => {
    // Skip mocked geolocation; integrate real service when available
    return next();
};

const wafMiddleware = (req, res, next) => {
    if (req.url.includes('/socket.io/')) {
        return next();
    }

    const patterns = [
        /<script.*?>/i,
        /javascript:/i,
        /UNION\s+SELECT/i,
        /OR\s+1\s*=\s*1/i,
        /\.\.\//, // Path traversal
        /eval\(/i,
        // NoSQL injection patterns
        /\$where/i,
        /\$regex/i,
        /\$ne/i,
        /\$gt/i,
        /\$lt/i,
        /\$or/i,
        /\$and/i,
        // Additional XSS vectors
        /on\w+\s*=/i,
        /data:\s*text\/html/i
    ];

    const check = (str) => {
        if (typeof str !== 'string') return false;
        return patterns.some(pattern => pattern.test(str));
    };

    const body = JSON.stringify(req.body);
    const query = JSON.stringify(req.query);
    const headers = JSON.stringify({
        'x-original-url': req.headers['x-original-url'],
        'x-rewrite-url': req.headers['x-rewrite-url'],
        'x-forwarded-host': req.headers['x-forwarded-host']
    });

    if (check(body) || check(query) || check(headers)) {
        console.error(`[WAF] Blocked a suspicious request from ${req.ip}`);
        return res.status(400).json({ error: 'Malformed request blocked by security policy.' });
    }

    next();
};

module.exports = { geoLoginCheck, wafMiddleware };
