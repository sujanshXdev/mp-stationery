// Network Information Utility
// Helps identify your LAN IP address for development

export const getNetworkInfo = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  
  return {
    currentURL: `${protocol}//${hostname}:${port}`,
    hostname,
    port,
    protocol,
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
    isLAN: hostname.startsWith('192.168.') || 
           hostname.startsWith('10.') ||
           /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  };
};

// Function to get your computer's LAN IP (for manual setup)
export const getLocalIPAddress = async (): Promise<string[]> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return [data.ip];
  } catch (error) {
    console.log('Could not fetch external IP. You can find your LAN IP manually:');
    console.log('Windows: ipconfig');
    console.log('Mac/Linux: ifconfig or ip addr');
    return [];
  }
};

// Log network info on import
console.log('🌐 Network Info:', getNetworkInfo()); 