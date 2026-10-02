/**
 * MobiTPV – Configuración Local
 * ─────────────────────────────
 * Este archivo configura la URL del backend para desarrollo local.
 * Incluye detección automática del servidor local.
 */

// Configuración para localhost
window.MOBITPV_CONFIG = {
  apiUrl: 'http://localhost:3001'  // Backend local
};

// Auto-detectar si el backend está disponible
(async function detectBackend() {
  try {
    const response = await fetch('http://localhost:3001/api/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(2000)  // 2 segundos timeout
    });
    
    if (response.ok) {
      console.log('✅ Backend local detectado en http://localhost:3001');
      window.MOBITPV_CONFIG.apiUrl = 'http://localhost:3001';
    } else {
      throw new Error('Backend no responde');
    }
  } catch (error) {
    console.log('⚠️ Backend local no disponible, usando datos mock');
    window.MOBITPV_CONFIG.apiUrl = '';
  }
})();