// Runtime environment configuration for GHCR → Azure Container Instances deployment

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

interface RuntimeConfig {
  API_URL?: string;
}

interface WindowWithConfig extends Window {
  __RUNTIME_CONFIG__?: RuntimeConfig;
}

const getApiUrl = (): string => {
  // 1. Check for runtime environment variable (set in Azure Container Instance)
  if (typeof window !== 'undefined') {
    const windowWithConfig = window as WindowWithConfig;
    if (windowWithConfig.__RUNTIME_CONFIG__?.API_URL) {
      if (DEBUG) console.log('Using runtime config API URL:', windowWithConfig.__RUNTIME_CONFIG__.API_URL);
      return windowWithConfig.__RUNTIME_CONFIG__.API_URL;
    }
  }
  
  // 2. Check build-time environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    if (DEBUG) console.log('Using build-time API URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 3. Auto-detect for Azure Container Instances
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    const protocol = window.location.protocol;
    
    if (DEBUG) console.log('Auto-detecting API URL from:', { currentHost, currentPort, protocol });
    
    // Azure Container Instances patterns
    if (currentHost.includes('.azurecontainer.io')) {
      // Pattern: university-frontend.eastus.azurecontainer.io → university-backend.eastus.azurecontainer.io
      let backendHost = currentHost;
      
      if (currentHost.includes('frontend')) {
        backendHost = currentHost.replace('frontend', 'backend');
      } else if (currentHost.includes('ui')) {
        backendHost = currentHost.replace('ui', 'api');
      } else {
        // Fallback: assume backend is on same host different port or subdomain
        backendHost = currentHost.replace('university-', 'university-backend-');
      }
      
      const backendUrl = `${protocol}//${backendHost}`;
      if (DEBUG) console.log('Detected Azure Container Instance, using:', backendUrl);
      return backendUrl;
    }
    
    // Generic pattern detection
    if (currentHost.includes('frontend') || currentHost.includes('ui')) {
      const backendHost = currentHost.replace(/frontend|ui/, 'backend');
      const backendUrl = `${protocol}//${backendHost}`;
      if (DEBUG) console.log('Generic pattern detection, using:', backendUrl);
      return backendUrl;
    }
  }
  
  // 4. Development fallback
  if (DEBUG) console.log('Using development fallback: http://localhost:8080');
  return 'http://localhost:8080';
};

export const env = {
  get API_URL() {
    return getApiUrl();
  },
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  JWT_EXPIRY_TIME: parseInt(process.env.NEXT_PUBLIC_JWT_EXPIRY_TIME || '900000'),
  REFRESH_TOKEN_EXPIRY: parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY || '604800000'),
};