/**
 * Mock for @decky/ui module
 */

const React = require('react');

module.exports = {
  // UI Components
  Button: jest.fn(({ children, onClick }) => 
    React.createElement('button', { onClick }, children)
  ),
  
  ButtonItem: jest.fn(({ children, onClick, label }) => 
    React.createElement('button', { onClick, 'aria-label': label }, children)
  ),
  
  PanelSection: jest.fn(({ children, title }) => 
    React.createElement('div', { className: 'panel-section' }, 
      title && React.createElement('h3', {}, title),
      children
    )
  ),
  
  PanelSectionRow: jest.fn(({ children }) => 
    React.createElement('div', { className: 'panel-section-row' }, children)
  ),
  
  TextField: jest.fn(({ value, onChange, label }) => 
    React.createElement('input', { 
      type: 'text', 
      value, 
      onChange: (e) => onChange(e.target.value),
      'aria-label': label 
    })
  ),
  
  Toggle: jest.fn(({ value, onChange, label }) => 
    React.createElement('input', { 
      type: 'checkbox', 
      checked: value, 
      onChange: (e) => onChange(e.target.checked),
      'aria-label': label 
    })
  ),
  
  Router: jest.fn(({ children }) => 
    React.createElement('div', { className: 'router' }, children)
  ),
  
  // Utilities
  showModal: jest.fn(),
  showContextMenu: jest.fn(),
  
  // Hooks
  useParams: jest.fn(() => ({})),
  
  // Constants
  SERVERAPI_TIMEOUT: 10000,
};