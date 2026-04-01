import pkg from '@clerk/backend';
const { verifyRequest, getAuth } = pkg;

export function requireAuth(req, res, next) {
    const auth = getAuth(req);
    
    if (!auth.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    req.userId = auth.userId;
    next();
}

export function optionalAuth(req, res, next) {
    try {
        const auth = getAuth(req);
        req.userId = auth.userId || null;
    } catch (err) {
        req.userId = null;
    }
    next();
}
