import { api } from '../api.js';
import { storage } from '../storage.js';

const PAIRING_STATES = {
  SCAN: 'scan',
  ENTER_CODE: 'enter_code',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  ERROR: 'error'
};

let currentState = PAIRING_STATES.SCAN;
let currentGateway = null;
let verificationCode = null;

export function renderGatewayPairingScreen(container, userId, onBack) {
  currentGateway = { userId };
  
  container.innerHTML = `
    <div class="screen" id="screenGateway">
      <div class="gateway-container">
        <div class="gateway-header">
          <button class="gateway-back-btn" id="gatewayBackBtn">← Back</button>
          <div class="gateway-title">OPENCLAW GATEWAY</div>
          <div class="gateway-subtitle">Connect your OpenClaw exercise machine to track workouts in real-time</div>
        </div>
        
        <div class="gateway-panel" id="gatewayPanel">
          ${renderScanPanel()}
        </div>
        
        <div class="gateway-paired-section" id="pairedSection">
          <div class="gen-label" style="margin-top: 24px">PAIRED GATEWAYS</div>
          <div class="gateway-list" id="gatewayList"></div>
        </div>
      </div>
    </div>
  `;
  
  setupEventListeners();
  loadPairedGateways();
}

function renderScanPanel() {
  return `
    <div class="gateway-scan-area" id="scanArea">
      <div class="qr-placeholder" id="qrPlaceholder">
        <div class="qr-icon">📡</div>
        <div class="qr-instructions">
          <p class="qr-title">Scan Gateway QR Code</p>
          <p class="qr-desc">Point your camera at the QR code on your OpenClaw Gateway device</p>
        </div>
      </div>
      <video id="qrVideo" class="qr-video" autoplay playsinline style="display: none;"></video>
      <div class="qr-overlay" id="qrOverlay" style="display: none;">
        <div class="qr-scan-line"></div>
      </div>
    </div>
    
    <div class="gateway-actions">
      <button class="gateway-action-btn primary" id="scanQrBtn">
        <span class="btn-icon">📷</span> Scan QR Code
      </button>
      <button class="gateway-action-btn secondary" id="enterCodeBtn">
        <span class="btn-icon">⌨️</span> Enter Code Manually
      </button>
    </div>
  `;
}

function renderCodeEntryPanel() {
  return `
    <div class="gateway-code-entry">
      <div class="code-icon">🔑</div>
      <p class="code-title">Enter Gateway Code</p>
      <p class="code-desc">Find the 8-character code on your Gateway device label</p>
      
      <div class="code-input-group">
        <input type="text" id="gatewayCodeInput" class="gateway-code-input" 
               placeholder="XXXXXXXX" maxlength="8" autocomplete="off" />
        <p class="code-hint">Code format: 8 alphanumeric characters (e.g., OC-GW-A1B2C3D4)</p>
      </div>
      
      <button class="gateway-action-btn primary" id="verifyCodeBtn">
        Verify Gateway
      </button>
      
      <button class="gateway-action-btn secondary" id="backToScanBtn">
        ← Back to Scan
      </button>
    </div>
  `;
}

function renderVerifyPanel(code) {
  return `
    <div class="gateway-verify-panel">
      <div class="verify-icon">🔍</div>
      <p class="verify-title">Verify Your Gateway</p>
      <p class="verify-desc">Confirm this is your device</p>
      
      <div class="verify-code-display">
        <span class="verify-label">Gateway Code:</span>
        <span class="verify-code">${code}</span>
      </div>
      
      <div class="verify-instructions">
        <p>Check that the code matches the label on your OpenClaw Gateway device.</p>
        <p class="verify-warning">⚠️ Make sure you're connecting to YOUR device, not someone else's.</p>
      </div>
      
      <div class="verify-actions">
        <button class="gateway-action-btn primary" id="confirmPairBtn">
          ✓ Yes, This Is My Gateway
        </button>
        <button class="gateway-action-btn secondary" id="cancelPairBtn">
          ← Cancel
        </button>
      </div>
    </div>
  `;
}

function renderSuccessPanel(gatewayId) {
  return `
    <div class="gateway-success-panel">
      <div class="success-icon">✅</div>
      <p class="success-title">Gateway Paired!</p>
      <p class="success-desc">Your OpenClaw Gateway is now connected</p>
      
      <div class="success-gateway-info">
        <div class="gateway-id-display">
          <span class="gateway-label">Gateway ID:</span>
          <span class="gateway-id">${gatewayId}</span>
        </div>
      </div>
      
      <button class="gateway-action-btn primary" id="donePairBtn">
        Done
      </button>
    </div>
  `;
}

function renderErrorPanel(message, onRetry) {
  return `
    <div class="gateway-error-panel">
      <div class="error-icon">❌</div>
      <p class="error-title">Pairing Failed</p>
      <p class="error-message">${message}</p>
      
      <button class="gateway-action-btn primary" id="retryPairBtn">
        Try Again
      </button>
      <button class="gateway-action-btn secondary" id="cancelErrorBtn">
        Cancel
      </button>
    </div>
  `;
}

function setupEventListeners() {
  document.getElementById('gatewayBackBtn')?.addEventListener('click', () => {
    if (currentState === PAIRING_STATES.ENTER_CODE || currentState === PAIRING_STATES.VERIFYING) {
      showScanPanel();
    } else {
      loadPairedGateways();
    }
  });
  
  document.getElementById('scanQrBtn')?.addEventListener('click', startQRScanner);
  document.getElementById('enterCodeBtn')?.addEventListener('click', showCodeEntry);
  document.getElementById('backToScanBtn')?.addEventListener('click', showScanPanel);
  
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'verifyCodeBtn') {
      await handleCodeVerification();
    }
    if (e.target.id === 'confirmPairBtn') {
      await handlePairingConfirm();
    }
    if (e.target.id === 'donePairBtn' || e.target.id === 'retryPairBtn' || e.target.id === 'cancelErrorBtn' || e.target.id === 'cancelPairBtn') {
      showScanPanel();
    }
  });
  
  const codeInput = document.getElementById('gatewayCodeInput');
  codeInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleCodeVerification();
    }
  });
}

async function startQRScanner() {
  const video = document.getElementById('qrVideo');
  const placeholder = document.getElementById('qrPlaceholder');
  const overlay = document.getElementById('qrOverlay');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    video.srcObject = stream;
    video.style.display = 'block';
    placeholder.style.display = 'none';
    overlay.style.display = 'block';
    
    const scanBtn = document.getElementById('scanQrBtn');
    if (scanBtn) {
      scanBtn.innerHTML = '<span class="btn-icon">⏹️</span> Stop Scanning';
      scanBtn.onclick = stopQRScanner;
    }
    
  } catch (err) {
    console.error('Camera access denied:', err);
    showCodeEntry();
  }
}

function stopQRScanner() {
  const video = document.getElementById('qrVideo');
  const placeholder = document.getElementById('qrPlaceholder');
  const overlay = document.getElementById('qrOverlay');
  
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  
  video.style.display = 'none';
  placeholder.style.display = 'flex';
  overlay.style.display = 'none';
  
  const scanBtn = document.getElementById('scanQrBtn');
  if (scanBtn) {
    scanBtn.innerHTML = '<span class="btn-icon">📷</span> Scan QR Code';
    scanBtn.onclick = startQRScanner;
  }
}

function showScanPanel() {
  currentState = PAIRING_STATES.SCAN;
  verificationCode = null;
  stopQRScanner();
  
  const panel = document.getElementById('gatewayPanel');
  if (panel) {
    panel.innerHTML = renderScanPanel();
    setupEventListeners();
  }
}

function showCodeEntry() {
  currentState = PAIRING_STATES.ENTER_CODE;
  stopQRScanner();
  
  const panel = document.getElementById('gatewayPanel');
  if (panel) {
    panel.innerHTML = renderCodeEntryPanel();
    setupEventListeners();
    document.getElementById('gatewayCodeInput')?.focus();
  }
}

function showVerifyPanel(code) {
  currentState = PAIRING_STATES.VERIFYING;
  verificationCode = code;
  
  const panel = document.getElementById('gatewayPanel');
  if (panel) {
    panel.innerHTML = renderVerifyPanel(code);
    setupEventListeners();
  }
}

function showSuccessPanel(gatewayId) {
  currentState = PAIRING_STATES.SUCCESS;
  
  const panel = document.getElementById('gatewayPanel');
  if (panel) {
    panel.innerHTML = renderSuccessPanel(gatewayId);
    setupEventListeners();
    loadPairedGateways();
  }
}

function showErrorPanel(message) {
  currentState = PAIRING_STATES.ERROR;
  
  const panel = document.getElementById('gatewayPanel');
  if (panel) {
    panel.innerHTML = renderErrorPanel(message);
    setupEventListeners();
  }
}

async function handleCodeVerification() {
  const input = document.getElementById('gatewayCodeInput');
  const code = input?.value.trim().toUpperCase();
  
  if (!code || code.length < 6) {
    showErrorPanel('Please enter a valid gateway code (at least 6 characters)');
    return;
  }
  
  showVerifyPanel(code);
}

async function handlePairingConfirm() {
  if (!verificationCode) return;
  
  try {
    if (currentGateway?.userId && !storage.get('user', {}).demo) {
      await api.gateways.pair(currentGateway.userId, verificationCode);
    }
    
    const gateways = storage.get('gateways', []);
    const exists = gateways.some(g => g.gateway_id === verificationCode);
    
    if (!exists) {
      gateways.push({
        gateway_id: verificationCode,
        gateway_name: `Gateway ${verificationCode.slice(-6)}`,
        paired_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      });
      storage.set('gateways', gateways);
    }
    
    showSuccessPanel(verificationCode);
    
  } catch (error) {
    console.error('Pairing error:', error);
    showErrorPanel('Failed to pair gateway. Please try again.');
  }
}

export async function loadPairedGateways() {
  const list = document.getElementById('gatewayList');
  if (!list) return;
  
  let gateways = storage.get('gateways', []);
  
  if (currentGateway?.userId && !storage.get('user', {}).demo) {
    try {
      const serverGateways = await api.gateways.list(currentGateway.userId);
      if (serverGateways.length > 0) {
        gateways = serverGateways.map(gw => ({
          gateway_id: gw.gateway_id,
          gateway_name: gw.gateway_name,
          paired_at: gw.paired_at,
          last_seen: gw.last_seen
        }));
        storage.set('gateways', gateways);
      }
    } catch (err) {
      console.error('Failed to fetch gateways from server:', err);
    }
  }
  
  if (gateways.length === 0) {
    list.innerHTML = `
      <div class="gateway-empty">
        <p>No gateways paired yet</p>
        <p class="gateway-empty-hint">Scan a QR code or enter your gateway code above to get started</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = gateways.map(gw => `
    <div class="gateway-item" data-gateway-id="${gw.gateway_id}">
      <div class="gateway-item-icon">📡</div>
      <div class="gateway-item-info">
        <div class="gateway-item-name">${gw.gateway_name || gw.gateway_id}</div>
        <div class="gateway-item-meta">Paired ${formatDate(gw.paired_at)}</div>
      </div>
      <button class="gateway-unpair-btn" onclick="window.grindApp?.unpairGateway('${gw.gateway_id}')">
        ✕
      </button>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function unpairGateway(gatewayId) {
  try {
    if (currentGateway?.userId && !storage.get('user', {}).demo) {
      await api.gateways.unpair(currentGateway.userId, gatewayId);
    }
    
    const gateways = storage.get('gateways', []);
    const filtered = gateways.filter(g => g.gateway_id !== gatewayId);
    storage.set('gateways', filtered);
    
    loadPairedGateways();
  } catch (error) {
    console.error('Unpair error:', error);
    const gateways = storage.get('gateways', []);
    const filtered = gateways.filter(g => g.gateway_id !== gatewayId);
    storage.set('gateways', filtered);
    loadPairedGateways();
  }
}

window.unpairGateway = unpairGateway;
