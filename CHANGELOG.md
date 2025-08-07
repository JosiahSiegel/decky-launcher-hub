# Changelog

All notable changes to Launcher Hub will be documented in this file.

## [1.5.0] - 2024-01-08

### Added
- 🚀 **Performance Optimizations**
  - Implemented 30-second caching for launcher and service data
  - Added cache invalidation on launcher install/uninstall
  - Reduced API calls during initialization

### Changed
- 📁 **Project Reorganization**
  - Moved source code to `src/` directory structure
  - Separated components into logical subdirectories
  - Consolidated configuration files in `config/` directory
  - Updated backend location to `src/backend/`

### Fixed
- ⚡ **Initial Loading Performance**
  - Removed redundant test API call during plugin initialization
  - Eliminated double data fetching on mount
  - Reduced console logging in production for better performance

### Improved
- 🧪 **Testing Infrastructure**
  - Updated all test import paths for new structure
  - Added cache clearing in test setup
  - Maintained 100% test coverage (43 tests passing)

### Removed
- 🗑️ **Redundant Files**
  - Removed unnecessary deployment scripts (deploy-with-sudo.sh, stage-deploy.sh)
  - Removed erroneous "2" package dependency
  - Cleaned up excessive console.log statements

### Documentation
- 📚 Updated README with performance optimization notes
- 📝 Created comprehensive PROJECT_STRUCTURE.md
- 🔧 Added Dependabot configuration for automated dependency updates

## [1.4.5] - 2024-01-07

### Fixed
- Fixed ESLint configuration issues
- Resolved Python test import errors
- Fixed command execution artifacts

## [1.4.0] - 2024-01-06

### Added
- Complete test suite with 100% coverage
- Frontend component tests (18 tests)
- Integration tests (15 tests)
- Python backend tests (10 tests)

### Changed
- Refactored Content component from debug-only to full launcher UI
- Implemented component-based architecture

## [1.3.0] - 2024-01-05

### Added
- Automated deployment scripts
- VSCode task integration
- GitHub Actions CI/CD pipeline

## [1.2.0] - 2024-01-04

### Added
- Service layer for backend communication
- Error handling utilities
- Type definitions for TypeScript

## [1.1.0] - 2024-01-03

### Added
- Basic launcher installation functionality
- Steam Deck Quick Access menu integration
- Debug panel for developers

## [1.0.0] - 2024-01-02

### Initial Release
- Basic plugin structure
- Decky Loader compatibility
- Python backend implementation
- React frontend with IIFE format