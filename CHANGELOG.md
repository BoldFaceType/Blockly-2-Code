# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-10-18

### Added
- **Progressive Web App (PWA) Functionality:**
  - The application can now be installed on desktop and mobile devices for offline access.
  - Implemented a service worker to cache application assets, allowing the editor to function without an internet connection.
  - Added a user prompt that appears when a new version of the app is available, allowing for a quick reload to get the latest updates.
  - The app now gracefully handles offline scenarios by disabling the AI-powered "Explain Code" feature and notifying the user that it requires an internet connection.
  - Configured the web app manifest (`manifest.json`) to define the app's name, icons, and theme.
  - Added placeholder icons for the PWA (requires user to replace with actual icons).