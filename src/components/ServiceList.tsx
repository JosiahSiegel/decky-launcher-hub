import React from 'react';
import { PanelSection, PanelSectionRow, ButtonItem } from '@decky/ui';
import { Service } from '../types/launcher';

interface ServiceListProps {
  services: Service[];
  onInstall: (serviceId: string) => void;
  onUninstall: (serviceId: string) => void;
  onLaunch: (serviceId: string) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ 
  services, 
  onInstall, 
  onUninstall,
  onLaunch 
}) => {
  return (
    <PanelSection title="Streaming Services">
      {services.length === 0 ? (
        <PanelSectionRow>
          <div style={{ padding: '10px' }}>No services available</div>
        </PanelSectionRow>
      ) : (
        services.map((service) => (
          <PanelSectionRow key={service.id}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Main service info and status */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{service.name}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    {service.description}
                  </div>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'right' }}>
                  {service.installing
                    ? `${service.install_phase || 'Installing'}... ${service.progress || 0}%`
                    : service.installed
                      ? '✓ Installed'
                      : 'Not Installed'}
                </div>
              </div>
              
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {service.installed ? (
                  <>
                    <ButtonItem
                      layout="inline"
                      onClick={() => onLaunch(service.id)}
                      disabled={service.installing}
                    >
                      Launch
                    </ButtonItem>
                    <ButtonItem
                      layout="inline"
                      onClick={() => onUninstall(service.id)}
                      disabled={service.installing}
                    >
                      Uninstall
                    </ButtonItem>
                  </>
                ) : (
                  <ButtonItem
                    layout="inline"
                    onClick={() => onInstall(service.id)}
                    disabled={service.installing}
                  >
                    {service.installing ? 'Installing...' : 'Install'}
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
