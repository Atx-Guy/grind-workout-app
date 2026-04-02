import { getGateways, pairGateway, unpairGateway } from '../api.js';
import { getCurrentUser } from './login.js';

export function renderGatewayPairingScreen(container) {
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = '<div class="gateway-error">Please sign in to manage gateways.</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="gateway-header">
            <h2>Gateway Pairing</h2>
            <p>Connect your workout sensors to GRIND</p>
        </div>
        <div class="gateway-code-section">
            <label>Enter Gateway Code</label>
            <input type="text" id="gatewayCodeInput" placeholder="e.g., GRIND-XYZ123" class="gateway-input" />
            <button onclick="window.pairGatewayHandler()" class="gateway-pair-btn">Pair Gateway</button>
        </div>
        <div class="gateway-list" id="gatewayList">
            <div class="gateway-loading">Loading gateways...</div>
        </div>
    `;
    
    window.pairGatewayHandler = async function() {
        const code = document.getElementById('gatewayCodeInput').value.trim();
        if (!code) return;
        
        try {
            await pairGateway(user.id, code);
            document.getElementById('gatewayCodeInput').value = '';
            loadGateways(user.id);
        } catch (error) {
            alert('Failed to pair gateway: ' + error.message);
        }
    };
    
    loadGateways(user.id);
}

async function loadGateways(userId) {
    const listEl = document.getElementById('gatewayList');
    if (!listEl) return;
    
    try {
        const gateways = await getGateways(userId);
        renderGatewayList(gateways, userId);
    } catch (error) {
        console.error('Error loading gateways:', error);
        listEl.innerHTML = '<div class="gateway-error">Failed to load gateways.</div>';
    }
}

function renderGatewayList(gateways, userId) {
    const listEl = document.getElementById('gatewayList');
    if (!listEl) return;
    
    if (!gateways || gateways.length === 0) {
        listEl.innerHTML = '<div class="gateway-empty">No gateways paired yet.</div>';
        return;
    }
    
    listEl.innerHTML = gateways.map(gw => `
        <div class="gateway-item">
            <div class="gateway-info">
                <div class="gateway-name">${gw.name || 'Gateway'}</div>
                <div class="gateway-id">${gw.id}</div>
                <div class="gateway-status ${gw.connected ? 'connected' : 'disconnected'}">
                    ${gw.connected ? 'Connected' : 'Disconnected'}
                </div>
            </div>
            <button onclick="window.unpairGatewayHandler('${gw.id}')" class="gateway-unpair-btn">Unpair</button>
        </div>
    `).join('');
    
    window.unpairGatewayHandler = async function(gatewayId) {
        if (!confirm('Unpair this gateway?')) return;
        try {
            await unpairGateway(userId, gatewayId);
            loadGateways(userId);
        } catch (error) {
            alert('Failed to unpair: ' + error.message);
        }
    };
}
