import { definePlugin } from '@decky/api';
import { staticClasses } from '@decky/ui';
import React from 'react';
import { FaRocket } from 'react-icons/fa';

// Initialize error handler
import { initializeErrorHandler } from './utils/errorHandler';
initializeErrorHandler();

// Main content component
import { Content } from './components/Content';

// Only export the plugin as default
// @ts-ignore - DefinePluginFn type mismatch, but works at runtime
export default definePlugin((serverApi: any) => {
  // Minimal initialization logging
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
