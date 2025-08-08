import React from 'react';
import { PanelSection, PanelSectionRow, ButtonItem } from '@decky/ui';
import { Backend } from '../services/Backend';
import { LauncherList } from './LauncherList';
import { ServiceList } from './ServiceList';
import { DebugPanel } from './DebugPanel';
import { AppState } from '../types/launcher';

interface ContentProps {
  serverAPI: any;
}

export const Content: React.FC<ContentProps> = ({ serverAPI }) => {
  const [state, setState] = React.useState<AppState>({
    launchers: [],
    services: [],
    loading: true,
    error: null,
  });

  const [debugInfo, setDebugInfo] = React.useState<string>('Initializing...');

  // Load launchers and services
  const loadData = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [launchers, services] = await Promise.all([
        Backend.getLaunchers(),
        Backend.getServices(),
      ]);

      setState((prev) => ({
        ...prev,
        launchers: Array.isArray(launchers) ? launchers : [],
        services: Array.isArray(services) ? services : [],
        loading: false,
      }));

      setDebugInfo(`Loaded ${launchers?.length || 0} launchers, ${services?.length || 0} services`);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error?.message || 'Failed to load data',
        loading: false,
      }));
      setDebugInfo(`Error: ${error?.message || error}`);
    }
  }, []);

  // Handle launcher installation
  const handleInstall = React.useCallback(
    async (launcherId: string) => {
      try {
        await Backend.installLauncher(launcherId);
        await loadData(); // Reload to get updated status
        serverAPI?.toaster?.toast?.(`Installing ${launcherId}...`);
      } catch (error: any) {
        serverAPI?.toaster?.toast?.(`Failed to install ${launcherId}`);
      }
    },
    [loadData, serverAPI]
  );

  // Handle launcher uninstallation
  const handleUninstall = React.useCallback(
    async (launcherId: string) => {
      try {
        await Backend.uninstallLauncher(launcherId);
        await loadData(); // Reload to get updated status
        serverAPI?.toaster?.toast?.(`Uninstalling ${launcherId}...`);
      } catch (error: any) {
        serverAPI?.toaster?.toast?.(`Failed to uninstall ${launcherId}`);
      }
    },
    [loadData, serverAPI]
  );

  // Handle launcher launch
  const handleLaunch = React.useCallback(
    async (launcherId: string) => {
      try {
        const result = await Backend.launchLauncher(launcherId);
        if (result?.result?.success) {
          // Find the launcher name for better toast message
          const launcher = [...state.launchers, ...state.services].find(l => l.id === launcherId);
          serverAPI?.toaster?.toast?.(`Launching ${launcher?.name || launcherId}...`);
        } else {
          serverAPI?.toaster?.toast?.(`Failed to launch ${launcherId}`);
        }
      } catch (error: any) {
        serverAPI?.toaster?.toast?.(`Failed to launch ${launcherId}`);
      }
    },
    [state.launchers, state.services, serverAPI]
  );

  React.useEffect(() => {
    // Set backend server
    Backend.setServer(serverAPI);

    // Load launcher data
    loadData();

    // Set up periodic refresh to catch installation status updates
    const interval = setInterval(() => {
      // Only refresh if something is installing
      const hasInstalling = [...state.launchers, ...state.services].some(
        item => item.installing
      );
      if (hasInstalling) {
        loadData();
      }
    }, 3000); // Refresh every 3 seconds when installing

    return () => clearInterval(interval);
  }, [serverAPI, loadData, state.launchers, state.services]);

  // Render loading state
  if (state.loading) {
    return (
      <PanelSection title="Launcher Hub">
        <PanelSectionRow>
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <PanelSection title="Launcher Hub">
        <PanelSectionRow>
          <div style={{ color: '#ff6b6b' }}>Error: {state.error}</div>
        </PanelSectionRow>
        <ButtonItem layout="below" onClick={loadData}>
          Retry
        </ButtonItem>
      </PanelSection>
    );
  }

  // Render main UI
  return (
    <>
      <LauncherList
        launchers={state.launchers}
        onInstall={handleInstall}
        onUninstall={handleUninstall}
        onLaunch={handleLaunch}
      />

      <ServiceList
        services={state.services}
        onInstall={handleInstall}
        onUninstall={handleUninstall}
        onLaunch={handleLaunch}
      />

      <DebugPanel serverAPI={serverAPI} debugInfo={debugInfo} />
    </>
  );
};
