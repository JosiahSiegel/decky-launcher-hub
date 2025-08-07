import React from 'react';
import { PanelSection, PanelSectionRow, ButtonItem } from '@decky/ui';
import { Service } from '../types/launcher';

interface ServiceListProps {
  services: Service[];
  onInstall: (serviceId: string) => void;
  onUninstall: (serviceId: string) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ services, onInstall, onUninstall }) => {
  return (
    <PanelSection title="Streaming Services">
      {services.length === 0 ? (
        <PanelSectionRow>
          <div style={{ padding: '10px' }}>No services available</div>
        </PanelSectionRow>
      ) : (
        services.map((service) => (
          <PanelSectionRow key={service.id}>
            <ButtonItem
              layout="below"
              onClick={() => {
                if (service.installed) {
                  onUninstall(service.id);
                } else {
                  onInstall(service.id);
                }
              }}
              disabled={service.installing}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{service.name}</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {service.installing
                    ? `Installing... ${service.progress || 0}%`
                    : service.installed
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
