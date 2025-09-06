import { env } from '@/config/env';

interface RuntimeConfig {
  API_URL?: string;
  APP_URL?: string;
}

interface WindowWithConfig extends Window {
  __RUNTIME_CONFIG__?: RuntimeConfig;
}

export function ConfigDebug() {
  // Show in both development and production for Azure debugging
  const isVisible = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.hostname.includes('azurecontainer'));

  if (!isVisible) {
    return null;
  }

  const runtimeConfig = typeof window !== 'undefined' ? (window as WindowWithConfig).__RUNTIME_CONFIG__ : null;

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '12px', 
      borderRadius: '8px',
      fontSize: '11px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔧 Config Debug</div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Active API URL:</strong> {env.API_URL}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>App URL:</strong> {env.APP_URL}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Current Host:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Build-time API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Runtime Config:</strong> {runtimeConfig ? '✅ Loaded' : '❌ Missing'}
      </div>
      
      {runtimeConfig && (
        <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', marginBottom: '4px' }}><strong>Runtime Values:</strong></div>
          <div>API: {runtimeConfig?.API_URL || 'NOT SET'}</div>
          <div>APP: {runtimeConfig?.APP_URL || 'NOT SET'}</div>
        </div>
      )}
      
      <div style={{ marginTop: '8px', fontSize: '9px', opacity: 0.7 }}>
        NODE_ENV: {process.env.NODE_ENV}
      </div>
    </div>
  );
}
