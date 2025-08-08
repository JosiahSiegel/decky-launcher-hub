module.exports = {
  staticClasses: {
    Title: 'title-class',
    Label: 'label-class',
  },
  PanelSection: ({ title, children }) => ({ title, children }),
  PanelSectionRow: ({ children }) => ({ children }),
  ButtonItem: ({ layout, onClick, children }) => ({ layout, onClick, children }),
  ToggleField: ({ label, checked, onChange }) => ({ label, checked, onChange }),
  SliderField: ({ label, value, min, max, onChange }) => ({ label, value, min, max, onChange }),
  Dropdown: ({ selectedOption, options, onChange }) => ({ selectedOption, options, onChange }),
  TextField: ({ label, value, onChange }) => ({ label, value, onChange }),
  Navigation: {
    Navigate: jest.fn(),
    NavigateBack: jest.fn(),
  },
  Modal: ({ children }) => ({ children }),
  showModal: jest.fn(),
  closeModal: jest.fn(),
};