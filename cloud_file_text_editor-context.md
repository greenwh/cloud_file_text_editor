# OneDrive PWA Text Editor Project Context
**Project**: Lightweight Mobile-First PWA for OneDrive Text File Editing
**Current Status**: Complete / Deployed - Version 1.0
**Date Documented**: September 27, 2025

## Project Overview
The OneDrive PWA Text Editor is a client-side web application designed to provide a simple, fast, and seamless way for users to make quick edits to text files stored in their Microsoft OneDrive account, primarily from a mobile device. It addresses the common workflow gap where simple edits require a cumbersome multi-app process (download, edit, re-upload). The application uses the Microsoft Graph API for direct file system interaction and MSAL.js for secure authentication.

## Architecture Overview
The architecture is entirely client-side, running within the user's browser. It communicates directly with Microsoft's APIs, ensuring no user data or credentials pass through a third-party server.

```
       User Action (Login, Open File, Save)
                   ↓
       Progressive Web App (Client-Side JS)
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   MSAL.js       CodeMirror     Microsoft
 (Authentication) (UI/Editor)     Graph API
        ↓                         (File I/O)
        ↓                              ↓
 Microsoft Identity Platform ↔↔↔ OneDrive Storage
```
**Core Philosophy**: Provide a secure, lightweight, and single-purpose tool that leverages official vendor APIs to enhance productivity on mobile devices. User control and data privacy are paramount.

## Current Directory Structure
```
.
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── index.html
├── style.css
├── script.js
├── manifest.json
├── service-worker.js
└── readme.md
```

## Technical Details

### Core Components
1.  **Authentication**: `MSAL.js` handles the OAuth 2.0 redirect flow to securely obtain access tokens from the Microsoft identity platform.
2.  **File System API**: The Microsoft Graph API is used for all file operations: listing folder contents, fetching file content, and saving content back to a file.
3.  **Editor UI**: `CodeMirror` provides the text editing component, including syntax highlighting, line numbers, and mobile-friendly text manipulation.
4.  **Application Shell**: The PWA structure (`manifest.json`, `service-worker.js`) allows the app to be installed on a device's home screen and provides offline caching of application assets.
5.  **File Browser**: A custom, modal-based file browser built with JavaScript provides navigation through the OneDrive folder structure without using external libraries.

### Dependencies
-   `msal-browser.min.js` (via CDN)
-   `codemirror.min.js` & associated mode/addon scripts (via CDN)

## Development Status & Version Evolution

The project's architecture evolved significantly during development to overcome technical challenges related to modern browser security policies.

-   **v0.1 (Initial Concept)**: Used the legacy `OneDrive.js` File Picker library. This provided a quick UI but failed in production due to security restrictions.
-   **v0.2 (Debugging Phase)**: Identified that the `Cross-Origin-Opener-Policy` (COOP) header on modern static hosting platforms (like GitHub Pages) fundamentally blocks the popup-based communication required by `OneDrive.js`.
-   **v1.0 (Final Architecture)**: The `OneDrive.js` library was completely removed. It was replaced with a custom file browser modal that interacts directly with the Microsoft Graph API. This approach aligns with modern security practices and provides a more robust and integrated user experience.

## Security & Safety Features

-   **OAuth 2.0**: All authentication uses the industry-standard OAuth 2.0 protocol managed by MSAL.js.
-   **Scoped Permissions**: The application requests only the necessary permissions (`User.Read`, `Files.ReadWrite`).
-   **No Server-Side Component**: The application is purely client-side. User access tokens are stored securely in the browser's session storage and are never transmitted to or stored on any third-party server.
-   **Public Client**: The application is registered as a "public client" (SPA), which is appropriate for applications where a client secret cannot be securely stored.

## Important Notes

### API Requirements
-   **Microsoft Account**: A free, personal Microsoft account is required to register the application and to use it.
-   **Azure App Registration**: The application **must** be registered in the Azure Portal to obtain a `Client ID`. This is a free process.
-   **Client ID**: The `Client ID` is a public identifier and is not a secret. It is safe to expose it in the client-side JavaScript code.

### Best Practices
-   **Use Redirect Flow**: The `redirect` authentication flow is more robust and compatible with strict browser security policies than the `popup` flow.
-   **Explicit User Actions**: The application only reads or writes files based on direct user interaction (clicking "Open File" or "Save File").
-   **Error Handling**: The application provides user-facing alerts for common API or network errors.

```