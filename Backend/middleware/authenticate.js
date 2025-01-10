const jwt = require('jsonwebtoken');

const JWT_SECRET = 'HdZXv90sPpwccnGbVGotaIVdAlk9SW39';

function authenticateToken(req, res, next) {
    const token =
        req.cookies.authToken ||
        req.body.authToken ||
        req.query.authToken ||
        req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. No token provided.',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({
            message: 'Invalid or expired token.',
        });
    }
}

module.exports = authenticateToken;
