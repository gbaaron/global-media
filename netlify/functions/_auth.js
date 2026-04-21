const jwt = require('jsonwebtoken');

function requireAdmin(event) {
    const token = (event.headers.authorization || event.headers.Authorization || '').replace('Bearer ', '');
    if (!token) {
        return { ok: false, statusCode: 401, body: { error: 'No authorization token' } };
    }
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'globalmedia-secret-change-in-production'
        );
        if (decoded.role !== 'admin') {
            return { ok: false, statusCode: 403, body: { error: 'Admin access required' } };
        }
        return { ok: true, decoded };
    } catch (err) {
        return { ok: false, statusCode: 401, body: { error: 'Invalid or expired token' } };
    }
}

module.exports = { requireAdmin };
