import { Clerk } from '@clerk/clerk-js';
import { setAuthToken } from '../api.js';
import { showScreen } from '../main.js';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

let clerk = null;
let session = null;

export async function initClerk() {
    if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY === 'pk_test_placeholder') {
        console.warn('Clerk publishable key not configured. Running in demo mode.');
        return { demo: true };
    }

    clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
    
    await clerk.load();
    
    if (clerk.user) {
        session = clerk.session;
        const token = await session.getToken();
        if (token) {
            setAuthToken(token);
        }
        return { 
            user: {
                id: clerk.user.id,
                email: clerk.user.primaryEmailAddress?.emailAddress,
                firstName: clerk.user.firstName,
                lastName: clerk.user.lastName
            }
        };
    }
    
    return { user: null, demo: false };
}

export async function openSignIn() {
    if (!clerk) {
        console.error('Clerk not initialized');
        return;
    }
    clerk.openSignIn({
        routing: 'hash',
        afterSignIn: async () => {
            session = clerk.session;
            const token = await session.getToken();
            if (token) {
                setAuthToken(token);
            }
            await onAuthSuccess();
        }
    });
}

export async function openSignUp() {
    if (!clerk) {
        console.error('Clerk not initialized');
        return;
    }
    clerk.openSignUp({
        routing: 'hash',
        afterSignUp: async () => {
            session = clerk.session;
            const token = await session.getToken();
            if (token) {
                setAuthToken(token);
            }
            await onAuthSuccess();
        }
    });
}

export async function signOut() {
    if (clerk) {
        await clerk.signOut();
    }
    setAuthToken(null);
    session = null;
}

export function isAuthenticated() {
    return clerk?.user != null;
}

export function getCurrentUser() {
    if (!clerk?.user) return null;
    return {
        id: clerk.user.id,
        email: clerk.user.primaryEmailAddress?.emailAddress,
        firstName: clerk.user.firstName,
        lastName: clerk.user.lastName
    };
}

async function onAuthSuccess() {
    const user = getCurrentUser();
    if (user) {
        window.dispatchEvent(new CustomEvent('clerk:authenticated', { detail: user }));
    }
}

export function onClerkReady(callback) {
    window.addEventListener('clerk:authenticated', (e) => callback(e.detail));
}

export { clerk, session };
