/**
 * Simplified entry point for Decky plugin
 * Returns the plugin directly without complex wrapping
 */

import { definePlugin, staticClasses } from 'decky-frontend-lib';
import { FaRocket } from 'react-icons/fa';
import { Content } from './components/Content';
import { Backend } from './services/Backend';
import { initializeErrorHandler } from './utils/errorHandler';

// Initialize error handler
initializeErrorHandler();

// Create and return the plugin
const plugin = definePlugin((serverApi: any) => {
  console.log('[LauncherHub] Plugin initialized');

  return {
    title: <div className={staticClasses.Title}>Launcher Hub</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaRocket />,
    onDismount() {
      console.log('[LauncherHub] Plugin unmounted');
    },
  };
});

// Export for Decky
(window as any).deckyplugin = plugin;

export default plugin;
