import React from 'react';
import { PanelSection, PanelSectionRow, ButtonItem } from '@decky/ui';
import { clearErrors, copyErrorsToConsole, loadStoredErrors } from '../utils/errorHandler';

interface DebugPanelProps {
  serverAPI: any;
  debugInfo: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ serverAPI, debugInfo }) => {
  const [showDebug, setShowDebug] = React.useState(false);
  const [globalErrors, setGlobalErrors] = React.useState<any[]>([]);
  const [storedErrors, setStoredErrors] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Load stored errors on mount
    setStoredErrors(loadStoredErrors());

    // Check for any global errors
    if ((window as any).LauncherHubErrors?.length > 0) {
      setGlobalErrors((window as any).LauncherHubErrors);
    }
  }, []);

  const handleClearErrors = () => {
    clearErrors();
    setGlobalErrors([]);
    setStoredErrors([]);
  };

  const handleReloadErrors = () => {
    setStoredErrors(loadStoredErrors());
    if ((window as any).LauncherHubErrors?.length > 0) {
      setGlobalErrors((window as any).LauncherHubErrors);
    }
  };

  return (
    <PanelSection title="Developer">
      <ButtonItem layout="below" onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
      </ButtonItem>

      {showDebug && (
        <>
          <PanelSectionRow>
            <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
              <strong>Status:</strong> {debugInfo}
            </div>
          </PanelSectionRow>

          <ButtonItem layout="below" onClick={() => copyErrorsToConsole(serverAPI)}>
            Log Errors to Backend
          </ButtonItem>

          <ButtonItem layout="below" onClick={handleClearErrors}>
            Clear All Errors
          </ButtonItem>

          <ButtonItem layout="below" onClick={handleReloadErrors}>
            Reload Errors
          </ButtonItem>

          {(globalErrors.length > 0 || storedErrors.length > 0) && (
            <PanelSectionRow>
              <div
                style={{
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '10px',
                  backgroundColor: '#1a1a1a',
                  padding: '5px',
                  borderRadius: '3px',
                }}
              >
                {globalErrors.length > 0 && (
                  <div>
                    <strong>Current Session Errors:</strong>
                    <pre
                      style={{ margin: '5px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                    >
                      {JSON.stringify(globalErrors, null, 2)}
                    </pre>
                  </div>
                )}
                {storedErrors.length > 0 && (
                  <div>
                    <strong>Stored Errors:</strong>
                    <pre
                      style={{ margin: '5px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                    >
                      {JSON.stringify(storedErrors, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </PanelSectionRow>
          )}
        </>
      )}
    </PanelSection>
  );
};
