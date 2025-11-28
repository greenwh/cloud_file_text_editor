# Project Overview
A lightweight Progressive Web App (PWA) designed to provide seamless text file editing capabilities for Microsoft OneDrive files. Optimized for mobile devices, allowing quick edits to cloud files without a download/upload cycle.

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+).
- **Auth**: MSAL.js 2.x (OAuth 2.0).
- **API**: Microsoft Graph API (OneDrive integration).
- **Editor**: CodeMirror 5.
- **Platform**: PWA (Service Worker).

## Key Features
- **Direct Cloud Access**: Read/Write directly to OneDrive.
- **Mobile-First**: Vertical layout optimized for phones.
- **Editor**: Syntax highlighting, line numbers, word wrap.
- **File Ops**: New, Open, Save, Save As, Close.

## Directory Structure
- `script.js`: Auth and Graph API logic.
- `index.html`: UI Shell.
- `manifest.json`: PWA config.

## Current Status
- **Deployed (v1.1)**: Fully functional with recent mobile UI improvements (Oct 2025).
- **Hosting**: GitHub Pages (implied/configured).