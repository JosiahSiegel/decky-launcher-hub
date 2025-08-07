import React from 'react';
import { PanelSection, PanelSectionRow, ButtonItem } from '@decky/ui';
import { Launcher } from '../types/launcher';

interface LauncherListProps {
  launchers: Launcher[];
  onInstall: (launcherId: string) => void;
  onUninstall: (launcherId: string) => void;
}

export const LauncherList: React.FC<LauncherListProps> = ({
  launchers,
  onInstall,
  onUninstall,
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
            <ButtonItem
              layout="below"
              onClick={() => {
                if (launcher.installed) {
                  onUninstall(launcher.id);
                } else {
                  onInstall(launcher.id);
                }
              }}
              disabled={launcher.installing}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{launcher.name}</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {launcher.installing
                    ? `Installing... ${launcher.progress || 0}%`
                    : launcher.installed
                      ? 'Installed'
                      : 'Not Installed'}
                </span>
              </div>
            </ButtonItem>
          </PanelSectionRow>
        ))
      )}
    </PanelSection>
  );
};
