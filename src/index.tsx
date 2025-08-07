import { ButtonItem, PanelSection, PanelSectionRow } from '@decky/ui';
import { definePlugin, staticClasses } from 'decky-frontend-lib';
import React from 'react';
import { FaRocket } from 'react-icons/fa';

// Global error handler to catch all errors and save to localStorage
if (typeof window !== 'undefined') {
  (window as any).LauncherHubErrors = [];
  
  const saveError = (errorObj: any) => {
    (window as any).LauncherHubErrors.push(errorObj);
    // Save to localStorage for persistence
    try {
      const errors = JSON.parse(localStorage.getItem('LauncherHubErrors') || '[]');
      errors.push(errorObj);
      // Keep only last 20 errors
      if (errors.length > 20) errors.shift();
      localStorage.setItem('LauncherHubErrors', JSON.stringify(errors));
      localStorage.setItem('LauncherHubLastError', JSON.stringify(errorObj));
    } catch (e) {
      console.error('[LauncherHub] Failed to save error to localStorage:', e);
    }
  };
  
  window.addEventListener('error', (e) => {
    console.error('[LauncherHub] Global error:', e);
    const errorObj = {
      time: new Date().toISOString(),
      type: 'error',
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      error: e.error?.stack || e.error?.toString() || e.error
    };
    saveError(errorObj);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[LauncherHub] Unhandled rejection:', e);
    const errorObj = {
      time: new Date().toISOString(),
      type: 'unhandledrejection',
      reason: e.reason?.stack || e.reason?.message || e.reason?.toString() || e.reason
    };
    saveError(errorObj);
  });
}

const Content = ({ serverAPI }: { serverAPI: any }) => {
  const [error, setError] = React.useState<string>('Initializing...');
  const [globalErrors, setGlobalErrors] = React.useState<any[]>([]);
  const [storedErrors, setStoredErrors] = React.useState<any[]>([]);
  
  // Function to load errors from localStorage
  const loadStoredErrors = () => {
    try {
      const errors = JSON.parse(localStorage.getItem('LauncherHubErrors') || '[]');
      setStoredErrors(errors);
    } catch (e) {
      console.error('[LauncherHub] Failed to load errors from localStorage:', e);
    }
  };
  
  // Function to clear all errors
  const clearErrors = () => {
    localStorage.removeItem('LauncherHubErrors');
    localStorage.removeItem('LauncherHubLastError');
    (window as any).LauncherHubErrors = [];
    setGlobalErrors([]);
    setStoredErrors([]);
  };
  
  // Function to copy errors to console and backend
  const copyErrorsToConsole = () => {
    const allErrors = {
      current: globalErrors,
      stored: storedErrors,
      lastError: localStorage.getItem('LauncherHubLastError')
    };
    console.log('[LauncherHub] All errors:', JSON.stringify(allErrors, null, 2));
    
    // Send to backend for journalctl logging
    if (serverAPI && serverAPI.callPluginMethod) {
      serverAPI.callPluginMethod('log_frontend_error', { error_data: allErrors })
        .then(() => console.log('[LauncherHub] Errors sent to backend'))
        .catch((e: any) => console.error('[LauncherHub] Failed to send errors to backend:', e));
    }
    
    // Also try to copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(allErrors, null, 2));
    }
  };
  
  React.useEffect(() => {
    // Load stored errors on mount
    loadStoredErrors();
    
    // Check for any global errors
    if ((window as any).LauncherHubErrors?.length > 0) {
      setGlobalErrors((window as any).LauncherHubErrors);
    }
    
    // Log what we're about to do
    console.log('[LauncherHub] Starting API test...');
    console.log('[LauncherHub] serverAPI received:', serverAPI);
    console.log('[LauncherHub] serverAPI type:', typeof serverAPI);
    
    // Just try to check if serverAPI exists
    try {
      if (!serverAPI) {
        const msg = 'serverAPI is null/undefined';
        console.error('[LauncherHub]', msg);
        setError(msg);
        return;
      }
      
      const keys = Object.keys(serverAPI);
      console.log('[LauncherHub] serverAPI keys:', keys);
      setError(`serverAPI keys: ${keys.join(', ')}`);
      
      if (typeof serverAPI.callPluginMethod !== 'function') {
        const msg = `callPluginMethod is not a function, it's: ${typeof serverAPI.callPluginMethod}`;
        console.error('[LauncherHub]', msg);
        setError(msg);
        return;
      }
      
      // Try the simplest possible call
      setError('About to call backend...');
      console.log('[LauncherHub] Calling get_launchers...');
      
      // Don't await, just call and see what happens
      const promise = serverAPI.callPluginMethod('get_launchers', {});
      
      if (!promise) {
        const msg = 'callPluginMethod returned null/undefined';
        console.error('[LauncherHub]', msg);
        setError(msg);
        return;
      }
      
      if (typeof promise.then !== 'function') {
        const msg = `callPluginMethod didn't return a promise, returned: ${typeof promise}`;
        console.error('[LauncherHub]', msg);
        setError(msg);
        return;
      }
      
      promise
        .then((result: any) => {
          const msg = `Success! Result: ${JSON.stringify(result)}`;
          console.log('[LauncherHub]', msg);
          setError(msg);
          // Log success to backend
          serverAPI.callPluginMethod('log_frontend_info', { message: msg });
        })
        .catch((err: any) => {
          const msg = `Promise rejected: ${err?.message || err?.toString() || JSON.stringify(err)}`;
          console.error('[LauncherHub]', msg);
          console.error('[LauncherHub] Full error object:', err);
          setError(msg);
          // Log error to backend for journalctl
          serverAPI.callPluginMethod('log_frontend_error', { 
            error_data: {
              message: msg,
              error: err?.stack || err?.toString() || err,
              type: 'api_call_failed'
            }
          });
        });
        
    } catch (e: any) {
      const msg = `Caught error: ${e?.message || e?.toString() || JSON.stringify(e)}`;
      console.error('[LauncherHub]', msg);
      console.error('[LauncherHub] Full error object:', e);
      setError(msg);
    }
  }, [serverAPI]);
  
  return (
    <PanelSection title="Debug Info">
      <PanelSectionRow>
        <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
          <strong>Status:</strong> {error}
        </div>
      </PanelSectionRow>
      
      <ButtonItem
        layout="below"
        onClick={copyErrorsToConsole}
      >
        Log Errors to Backend
      </ButtonItem>
      
      <ButtonItem
        layout="below"
        onClick={clearErrors}
      >
        Clear All Errors
      </ButtonItem>
      
      <ButtonItem
        layout="below"
        onClick={loadStoredErrors}
      >
        Reload Errors
      </ButtonItem>
      
      {(globalErrors.length > 0 || storedErrors.length > 0) && (
        <PanelSectionRow>
          <div style={{ 
            maxHeight: '200px', 
            overflow: 'auto', 
            fontSize: '10px', 
            backgroundColor: '#1a1a1a',
            padding: '5px',
            borderRadius: '3px'
          }}>
            {globalErrors.length > 0 && (
              <div>
                <strong>Current Session Errors:</strong>
                <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(globalErrors, null, 2)}
                </pre>
              </div>
            )}
            {storedErrors.length > 0 && (
              <div>
                <strong>Stored Errors:</strong>
                <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(storedErrors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
};

export default definePlugin((serverApi: any) => {
  // Log everything about initialization
  console.log('[LauncherHub] ============ PLUGIN INIT ============');
  console.log('[LauncherHub] typeof serverApi:', typeof serverApi);
  console.log('[LauncherHub] serverApi value:', serverApi);
  
  try {
    if (serverApi && typeof serverApi === 'object') {
      console.log('[LauncherHub] serverApi keys:', Object.keys(serverApi));
      console.log('[LauncherHub] serverApi.callPluginMethod type:', typeof serverApi.callPluginMethod);
      
      // Try to get plugin info
      if (serverApi.callPluginMethod) {
        console.log('[LauncherHub] Attempting test call to backend...');
        serverApi.callPluginMethod('get_launchers', {})
          .then((result: any) => {
            console.log('[LauncherHub] Test call SUCCESS:', result);
          })
          .catch((err: any) => {
            console.error('[LauncherHub] Test call FAILED:', err);
            console.error('[LauncherHub] Error details:', {
              message: err?.message,
              stack: err?.stack,
              toString: err?.toString?.()
            });
          });
      }
    }
  } catch (e: any) {
    console.error('[LauncherHub] Error during init:', e);
  }
  
  console.log('[LauncherHub] ============ END INIT ============');
  
  return {
    title: <div className={staticClasses.Title}>Launcher Hub</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaRocket />,
    onDismount() {
      console.log('[LauncherHub] Plugin unmounted');
    },
  };
});