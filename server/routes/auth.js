import express from 'express';
import pkg from '@clerk/backend';
const { verifyWebhook, signedOff, getAuth } = pkg;

const router = express.Router();

router.post('/webhook/clerk', async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    try {
        const verified = await verifyWebhook(req);
        if (!verified) {
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }
        
        const { type, data } = req.body;
        console.log(`Clerk webhook: ${type}`, data);
        
        switch (type) {
            case 'user.created':
            case 'user.updated':
                console.log(`User ${type}:`, data.id, data.email_addresses?.[0]?.email_address);
                break;
            case 'user.deleted':
                console.log(`User deleted:`, data.id);
                break;
        }
        
        res.json({ received: true });
    } catch (err) {
        console.error('Webhook verification failed:', err);
        res.status(400).json({ error: 'Webhook verification failed' });
    }
});

router.get('/me', (req, res) => {
    const auth = getAuth(req);
    
    if (!auth.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json({
        userId: auth.userId,
        sessionId: auth.sessionId,
        publicMetadata: auth.publicMetadata
    });
});

router.post('/logout', (req, res) => {
    res.json({ success: true });
});

export default router;
