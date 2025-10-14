# Project Overview
A lightweight Progressive Web App designed to provide seamless text file editing capabilities for Microsoft OneDrive files, specifically optimized for mobile devices. The application addresses the workflow gap of making quick edits to configuration files, code snippets, or notes without the cumbersome download-edit-upload process typically required on mobile devices.

## OneDrive PWA Text Editor Project Context
**Project**: OneDrive Progressive Web App Text Editor
**Current Status**: Deployed & Functional (v1.0) with Known Issues
**Date Created**: September 26, 2025
**Last Updated**: October 4, 2025
**Live Demo**: [https://greenwh.github.io/cloud_file_text_editor/](https://greenwh.github.io/cloud_file_text_editor/)

## Architecture Overview
```
         User Device (Mobile/Desktop)
                   ↓
        Progressive Web App (Client-Side)
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    MSAL.js       CodeMirror    Microsoft
  (Auth & Token)   (Editor)     Graph API
       ↓                         (Files)
       ↓                            ↓
Microsoft Identity ←→←→←→ OneDrive File System
    Platform
```

**Core Philosophy**: Zero-server architecture with direct API integration for maximum security, privacy, and performance on mobile devices.

## Current Directory Structure
```
cloud_file_text_editor/
├── .git/                       # Git repository
├── icons/
│   ├── icon-192x192.png        # PWA icon (192px)
│   └── icon-512x512.png        # PWA icon (512px)
├── index.html                  # Main application shell
├── style.css                   # Mobile-first responsive styles
├── script.js                   # Core application logic
├── manifest.json               # PWA manifest
├── service-worker.js           # Service worker for caching
├── README.md                   # Project documentation
├── cloud_file_text_editor-context.md  # Existing context file
├── logo.svg                    # Application logo
└── todo.txt                    # Current issues/enhancements
```

## Technology Stack & Dependencies

### Core Technologies
- **HTML5/CSS3/JavaScript (ES6+)**: Pure client-side implementation
- **Progressive Web App**: Manifest + Service Worker for offline/install capability
- **Microsoft Authentication Library (MSAL.js 2.x)**: OAuth 2.0 authentication
- **Microsoft Graph API**: Direct OneDrive file system integration
- **CodeMirror 5.65.2**: Text editor with syntax highlighting

### External Dependencies (CDN)
```javascript
// Authentication
https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js

// Editor
https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js
https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css
// + Various CodeMirror modes and themes
```

## Key Features & Functionality

### ✅ Implemented Features
1. **Secure Authentication**: OAuth 2.0 via MSAL.js with redirect flow
2. **File Browser**: Custom modal-based OneDrive navigation
3. **Text Editing**: CodeMirror editor with syntax highlighting
4. **File Operations**: Open/Save files directly to OneDrive
5. **PWA Capabilities**: Install to home screen, offline caching
6. **Mobile Optimization**: Touch-friendly interface, responsive design
7. **Language Support**: Auto-detection and highlighting for common file types

### 🔧 Core Components
- **Authentication Manager**: Handles Microsoft login/logout and token management
- **Graph API Client**: Direct Microsoft Graph API integration for file operations
- **File Browser Modal**: Custom OneDrive folder/file navigation interface
- **Editor Interface**: CodeMirror integration with mobile optimizations
- **PWA Shell**: Service worker and manifest for app-like experience

## Current Status & Known Issues

### 🟢 Working Functionality
- User authentication via Microsoft OAuth 2.0
- OneDrive file browsing and selection
- File content loading and display
- Syntax highlighting for multiple languages
- File saving back to OneDrive
- PWA installation and offline assets caching

### 🔴 Known Issues (from todo.txt)
1. **Cache Issue**: Saved changes appear in OneDrive but reloading shows old cached version
2. **UI Overlap**: Text sometimes overlaps line numbers when opening files
3. **Scrolling Problems**:
   - Clumsy scrolling behavior
   - Cursor can appear outside text window in white space
   - Text doesn't always move properly within the text window

### 🔨 Requested Enhancements
1. **File Closer**: Add ability to close current file without opening another
2. **Save As**: Implement "Save As" functionality for file duplication/renaming

## Technical Implementation Details

### Authentication Flow
```javascript
// Client ID: 72445ccf-a776-4d59-a35e-eb790a5db442 (Public, safe to expose)
// Scopes: ["User.Read", "Files.ReadWrite"]
// Flow: OAuth 2.0 Authorization Code with PKCE (redirect method)
```

### File Operations
- **List Files**: `GET /me/drive/root/children`
- **Read File**: `GET /me/drive/items/{file-id}/content`
- **Write File**: `PUT /me/drive/items/{file-id}/content`
- **Navigate Folders**: `GET /me/drive/items/{folder-id}/children`

### Security Model
- **Zero-Server Architecture**: No backend server, all operations client-side
- **Token Storage**: Session storage (not persistent)
- **Scoped Permissions**: Minimal required permissions only
- **Public Client**: Appropriate for client-side applications

## Development Evolution & Architecture Decisions

### Version History
- **v0.1**: Initial implementation using OneDrive.js File Picker SDK
- **v0.2**: Debugging phase - discovered COOP header conflicts with popup-based auth
- **v1.0**: Complete rewrite with custom Graph API integration, eliminating OneDrive.js

### Key Architectural Decisions
1. **Removed OneDrive.js**: Replaced with direct Graph API calls due to security policy conflicts
2. **Redirect vs Popup Auth**: Chose redirect flow for better mobile compatibility
3. **Custom File Browser**: Built modal-based file picker for better UX control
4. **Pure Client-Side**: Maintained zero-server architecture for security and simplicity

## Development Environment & Deployment

### Local Development
```bash
# Simple HTTP server for testing
npm install -g http-server
cd cloud_file_text_editor
http-server
```

### Deployment
- **Current**: GitHub Pages at greenwh.github.io/cloud_file_text_editor/
- **Requirements**: Static hosting with HTTPS support
- **Configuration**: Update `redirectUri` in script.js for different domains

### Azure App Registration
- **Client ID**: 72445ccf-a776-4d59-a35e-eb790a5db442
- **Type**: Single Page Application (SPA)
- **Redirect URI**: https://greenwh.github.io/cloud_file_text_editor/
- **Permissions**: User.Read, Files.ReadWrite

## Next Steps & Improvement Opportunities

### 🔥 High Priority Fixes
1. **UI Layout Fixes**: Resolve text/line number overlap and scrolling issues
2. **Mobile UX Polish**: Improve touch scrolling and cursor positioning

### 🚀 Enhancement Opportunities
1. **File Management**: Add close file, save as, rename, delete functionality
2. **Enhanced Editor**: Search/replace, themes, larger file support
3. **Offline Editing**: Enable editing with sync when connection restored
4. **Backup/Recovery**: Auto-save drafts locally for crash recovery
5. **Multi-File Support**: Tabs or file switching capability

### 🔍 Technical Improvements
1. **Error Handling**: More robust error messages and recovery
2. **Performance**: Optimize for larger files and slower connections
3. **Accessibility**: ARIA labels and keyboard navigation
4. **Testing**: Automated testing suite for core functionality

## Integration with AI OS

### Context File Purpose
This project represents a successful completion of a specific development goal - creating a mobile-optimized OneDrive text editor. It demonstrates:
- Full-stack thinking with zero-server architecture
- Integration with third-party APIs (Microsoft Graph)
- Mobile-first responsive design
- PWA development patterns
- OAuth 2.0 implementation
- Problem-solving through architecture evolution

### Lessons Learned
1. **Security Policies Matter**: Modern browser security can break older SDK approaches
2. **Direct API Integration**: Sometimes custom implementation is more reliable than SDKs
3. **Mobile-First Development**: Touch interactions require different UX considerations
4. **Authentication Flows**: Redirect flow is more robust than popup for mobile PWAs

### Future AI OS Integration
This project could serve as:
- **Template**: For other API integration projects
- **Component**: Mobile text editor for AI OS internal tools
- **Case Study**: Example of overcoming technical challenges through iteration

## Important File References
- **Main Logic**: `/script.js:1-50` (authentication and editor setup)
- **Authentication Config**: `/script.js:6-18` (MSAL configuration)
- **File Operations**: `/script.js:50+` (Graph API calls)
- **UI Structure**: `/index.html:16-50` (main application shell)
- **PWA Config**: `/manifest.json:1-21` (app metadata)
- **Known Issues**: `/todo.txt:1-12` (current problems and requests)

---

## Recent Development Activity (September 2025)

### Last 5 Commits
```
ba53ad6 - Fixed a bug in caching (Sep 27)
47dbac9 - Fix file picker problem (Sep 27)
8676f5f - Fixing file open (Sep 26)
d840cb1 - Fixing file open (Sep 26)
14fcc0c - Fixing file open (Sep 26)
```

### Bug Fixes (September 2025)
1. **File Open Issues**: Multiple commits addressing file picker and open functionality
2. **Caching Bug**: Fixed service worker caching issue
3. **Stability**: Iterative improvements to core file operations

### Current State (October 2025)
**Uncommitted Changes**: 8 files modified
- `README.md`, `index.html`, `manifest.json`
- `script.js`, `service-worker.js`, `style.css`
- `todo.txt`, `cloud_file_text_editor-context.md`

**Project Health**: Deployed and functional with known UI issues tracked in todo.txt

**Known Issues** (10 items in todo.txt):
- Word wrap option needed
- Text overflow over line numbers
- Scrolling clumsy (text doesn't always move properly)
- Cursor sometimes outside text window

---
**Next Actions**: Focus on fixing the cache issue and UI layout problems to improve user experience, then consider adding file management enhancements.