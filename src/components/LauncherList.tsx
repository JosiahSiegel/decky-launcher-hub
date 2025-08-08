import React from 'react';
import { PanelSection, PanelSectionRow, ButtonItem } from '@decky/ui';
import { Launcher } from '../types/launcher';

interface LauncherListProps {
  launchers: Launcher[];
  onInstall: (launcherId: string) => void;
  onUninstall: (launcherId: string) => void;
  onLaunch: (launcherId: string) => void;
}

export const LauncherList: React.FC<LauncherListProps> = ({
  launchers,
  onInstall,
  onUninstall,
  onLaunch,
}) => {
  return (
    <PanelSection title="Game Launchers">
      {launchers.length === 0 ? (
        <PanelSectionRow>
          <div style={{ padding: '10px' }}>No launchers available</div>
        </PanelSectionRow>
      ) : (
        launchers.map((launcher) => (
          <PanelSectionRow key={launcher.id}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Main launcher info and status */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{launcher.name}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    {launcher.description}
                  </div>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'right' }}>
                  {launcher.installing
                    ? `${launcher.install_phase || 'Installing'}... ${launcher.progress || 0}%`
                    : launcher.installed
                      ? '✓ Installed'
                      : 'Not Installed'}
                </div>
              </div>
              
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {launcher.installed ? (
                  <>
                    <ButtonItem
                      layout="inline"
                      onClick={() => onLaunch(launcher.id)}
                      disabled={launcher.installing}
                    >
                      Launch
                    </ButtonItem>
                    <ButtonItem
                      layout="inline"
                      onClick={() => onUninstall(launcher.id)}
                      disabled={launcher.installing}
                    >
                      Uninstall
                    </ButtonItem>
                  </>
                ) : (
                  <ButtonItem
                    layout="inline"
                    onClick={() => onInstall(launcher.id)}
                    disabled={launcher.installing}
                  >
                    {launcher.installing ? 'Installing...' : 'Install'}
                  </ButtonItem>
                )}
              </div>
            </div>
          </PanelSectionRow>
        ))
      )}
    </PanelSection>
  );
};
