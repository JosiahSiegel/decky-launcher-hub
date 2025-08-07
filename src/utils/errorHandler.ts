/**
 * Global error handling utilities
 */

export const initializeErrorHandler = () => {
  if (typeof window !== 'undefined') {
    (window as any).LauncherHubErrors = [];

    const saveError = (errorObj: any) => {
      (window as any).LauncherHubErrors.push(errorObj);
      // Save to localStorage for persistence
      try {
        const errors = JSON.parse(localStorage.getItem('LauncherHubErrors') || '[]');
        errors.push(errorObj);
        // Keep only last 20 errors
        if (errors.length > 20) {
          errors.shift();
        }
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
        error: e.error?.stack || e.error?.toString() || e.error,
      };
      saveError(errorObj);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('[LauncherHub] Unhandled rejection:', e);
      const errorObj = {
        time: new Date().toISOString(),
        type: 'unhandledrejection',
        reason: e.reason?.stack || e.reason?.message || e.reason?.toString() || e.reason,
      };
      saveError(errorObj);
    });
  }
};

export const loadStoredErrors = () => {
  try {
    const errors = JSON.parse(localStorage.getItem('LauncherHubErrors') || '[]');
    return errors;
  } catch (e) {
    console.error('[LauncherHub] Failed to load errors from localStorage:', e);
    return [];
  }
};

export const clearErrors = () => {
  localStorage.removeItem('LauncherHubErrors');
  localStorage.removeItem('LauncherHubLastError');
  (window as any).LauncherHubErrors = [];
};

export const copyErrorsToConsole = (serverAPI: any) => {
  const allErrors = {
    current: (window as any).LauncherHubErrors || [],
    stored: loadStoredErrors(),
    lastError: localStorage.getItem('LauncherHubLastError'),
  };
  console.log('[LauncherHub] All errors:', JSON.stringify(allErrors, null, 2));

  // Send to backend for journalctl logging
  if (serverAPI && serverAPI.callPluginMethod) {
    serverAPI
      .callPluginMethod('log_frontend_error', { error_data: allErrors })
      .then(() => console.log('[LauncherHub] Errors sent to backend'))
      .catch((e: any) => console.error('[LauncherHub] Failed to send errors to backend:', e));
  }

  // Also try to copy to clipboard if available
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(JSON.stringify(allErrors, null, 2))
      .then(() => console.log('[LauncherHub] Errors copied to clipboard'))
      .catch((e: any) => console.log('[LauncherHub] Could not copy to clipboard (browser restriction):', e.message));
  }
};
