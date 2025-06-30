// API Configuration Utility
// Automatically detects environment and sets appropriate backend URL

const getBackendURL = (): string => {
  const hostname = window.location.hostname;
  const port = '5000'; // Backend port
  
  // Check if running on localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}`;
  }
  
  // Check if running on LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  if (
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    return `http://${hostname}:${port}`;
  }
  
  // For ngrok or other tunneled URLs, use environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback to localhost
  return `http://localhost:${port}`;
};

const serverURL = getBackendURL();

export const SERVER_BASE_URL = serverURL;
export const API_BASE_URL = `${serverURL}/api/v1`;

// Log the detected environment for debugging
console.log('🌐 Environment detected:', {
  hostname: window.location.hostname,
  backendURL: API_BASE_URL,
  serverURL: SERVER_BASE_URL,
  isLocalhost: window.location.hostname === 'localhost',
  isLAN: window.location.hostname.startsWith('192.168.') || 
         window.location.hostname.startsWith('10.') ||
         /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)
}); 