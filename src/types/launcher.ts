/**
 * Type definitions for launchers and services
 */

export interface Launcher {
  id: string;
  name: string;
  installed: boolean;
  installing?: boolean;
  progress?: number;
  install_phase?: string;
  description?: string;
  icon?: string;
}

export interface Service {
  id: string;
  name: string;
  installed: boolean;
  installing?: boolean;
  progress?: number;
  install_phase?: string;
  description?: string;
  icon?: string;
}

export interface AppState {
  launchers: Launcher[];
  services: Service[];
  loading: boolean;
  error: string | null;
}
