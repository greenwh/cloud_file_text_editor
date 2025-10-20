# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OneDrive PWA Text Editor is a lightweight, client-side Progressive Web App for editing text files on OneDrive from mobile devices. It uses OAuth 2.0 authentication (MSAL.js), Microsoft Graph API for file operations, and CodeMirror for syntax highlighting. Zero-server architecture—all logic runs in the browser.

**Live Demo:** https://greenwh.github.io/cloud_file_text_editor/

## Quick Start Commands

### Local Development
```bash
# Start a simple HTTP server for local testing
npm install -g http-server
cd /path/to/cloud_file_text_editor
http-server
# Visit http://localhost:8080
```

### Configuration
1. Register app with Microsoft Azure App Registrations portal
2. Update `redirectUri` in `script.js:12` to match your deployment URL
3. Update `clientId` in `script.js:6` with your Azure Application ID

### Deployment
- Push to GitHub and enable Pages on your `gh-pages` branch, or
- Deploy to any static hosting (Netlify, Vercel) with HTTPS support
- Update `redirectUri` in Azure App Registration for new deployment URLs

## Architecture

### High-Level Data Flow
```
User (Browser)
    ↓
[index.html + service-worker.js + manifest.json]
    ↓
[script.js] - Main application logic
    ├─→ MSAL.js (Microsoft authentication)
    ├─→ CodeMirror (text editor with syntax highlighting)
    └─→ Microsoft Graph API (OneDrive file operations)
         ↓
    OneDrive (cloud storage)
```

### Core Modules in script.js

| Function | Purpose | Key Details |
|----------|---------|-------------|
| `newFile()` | Create a new untitled file | Prompts for unsaved changes; initializes empty editor |
| `closeFile()` | Close current file and clear editor | Prompts for unsaved changes |
| `toggleWordWrap()` | Toggle line wrapping on/off | Updates button background color as visual indicator |
| `updateEditorSize()` | Auto-size editor to container | Called on init, login, and window resize |
| `updateUI()` | Render UI based on auth state | Shows/hides buttons and editor based on user login |
| `signIn()` / `signOut()` | Authentication handlers | Uses MSAL OAuth 2.0 redirect flow |
| `getToken()` | Acquire Graph API access token | Handles silent token acquisition and refresh |
| `showFilePicker(folderId, parentId)` | Display OneDrive folder browser | Fetches children from Graph API; handles folder navigation |
| `handleItemClick(item)` | Navigate folders or load files | Recursively navigates folder hierarchy or loads file content |
| `loadFile(fileItem)` | Fetch file content and populate editor | Auto-detects language and loads CodeMirror mode |
| `saveFile()` | Upload edited content back to OneDrive | Triggers Save As flow for unsaved files (no ID) |
| `saveFileAs()` | Create new file in selected folder | Uses Graph API path-based upload endpoint |
| `closeModal()` | Hide file picker modal | Resets breadcrumb path display |

### External Dependencies (via CDN)
- **MSAL.js 2.x**: Microsoft authentication
- **CodeMirror 5.65.2**: Code editor with syntax highlighting
- **CodeMirror Material Darker theme**: Default editor theme
- **CodeMirror modes**: Loaded dynamically from CDN based on file extension

### Microsoft Graph API Endpoints Used
- `GET /me/drive/root/children` — List files in root
- `GET /me/drive/items/{folder-id}/children` — List files in folder
- `GET /me/drive/items/{file-id}/content` — Download file
- `PUT /me/drive/items/{file-id}/content` — Upload file

### OAuth Scopes
- `User.Read` — Read user profile information
- `Files.ReadWrite` — Read and write files in OneDrive

## File Structure

```
.
├── index.html                # HTML shell (70 lines)
├── script.js                 # Main app logic (364 lines)
├── style.css                 # Styling (190 lines)
├── service-worker.js         # PWA cache strategy (64 lines)
├── manifest.json             # PWA configuration
├── logo.svg                  # App icon
├── icons/                    # PWA icon assets (192x192, 512x512)
├── README.md                 # User-facing documentation
├── GEMINI.md                 # Development context and history
└── todo.txt                  # Known issues and feature requests
```

## Key Implementation Details

### Authentication
- **Client ID**: Hardcoded in `script.js:6` (public, safe for client-side SPA)
- **Auth Flow**: OAuth 2.0 redirect (not popup) for better mobile compatibility
- **Token Storage**: Session storage (not persistent across browser closes)
- **Config**: `script.js:8-18` defines MSAL configuration

### Editor Integration
- CodeMirror initialized in `script.js:48-53`
- Theme: Material Darker
- Line numbers: Enabled
- Read-only until file is loaded
- Language mode loaded dynamically from CDN based on file extension
- Word wrapping: Toggleable via "WW" button; off by default
- Dirty flag tracking: Monitors unsaved changes and prompts user before close

### PWA & Service Worker
- **Cache Version**: `v18` (in `service-worker.js:5`)
- **Cache Strategy**: Cache-first for assets; network-only for Graph API calls
- **Graph API Bypass**: `graph.microsoft.com` requests always use network (never cached)
- **Offline Support**: App shell and editor cached; API calls require connection
- When cache version changes, old caches are automatically cleaned up
- Service worker registered with scope `./` for proper path handling

### Mobile Optimization
- Responsive flexbox layout
- Material Design aesthetic (blue theme #2196f3)
- Touch-friendly modal interface with emoji icons (📄 file, 📁 folder, ⬆️ parent)

## Recently Resolved Features

1. ✅ **Word Wrap Toggle**: Added "WW" button to toggle line wrapping on/off
2. ✅ **New File**: Create untitled file with "New" button
3. ✅ **Close File**: Close current file with "Close" button
4. ✅ **Save As**: Save new files to selected OneDrive folder with custom filename
5. ✅ **Unsaved Changes Warning**: Prompts user before closing/switching files with pending edits
6. ✅ **Dirty Flag Tracking**: Tracks editor modifications in real-time
7. ✅ **Layout Manager**: Robust editor sizing on init, login, and window resize
8. ✅ **Fix for Text Overlap**: Line number padding properly configured in CSS

## Known Issues (from todo.txt)

1. **Scrolling Issues**: Clumsy scrolling behavior may persist on some devices; cursor can appear outside text window in white space

## Common Development Tasks

### Adding a New CodeMirror Mode
The app already dynamically loads language modes. To support a new file extension:
1. Add the MIME type mapping in CodeMirror (or rely on CodeMirror.findModeByExtension)
2. The mode will load automatically from CDN when a file of that type is opened

### Updating the Azure App Registration
If changing deployment URL:
1. Update `redirectUri` in `script.js:12`
2. Update `redirectUri` in Azure Portal → App Registrations → Your App → Authentication

### Changing the Cache Version (for PWA updates)
Modify the version string in `service-worker.js:5`:
```javascript
const CACHE_NAME = 'onedrive-text-editor-cache-v19'; // Increment to invalidate old caches
```

### Working with Save As
- When saving a new file (created with "New" button), the app triggers Save As flow
- User selects folder in file picker and enters filename in input field at bottom
- Files in Save As mode are disabled to prevent opening them instead of selecting folder
- After save, file receives ID from Graph API response and becomes updatable via normal save

### Debugging Graph API Calls
- Check browser Network tab for API requests to `graph.microsoft.com`
- Use `getToken()` to verify authentication token is valid
- Common errors: 401 (expired token), 404 (file not found), 403 (insufficient permissions)

## Testing Locally

1. Start `http-server`
2. Visit `http://localhost:8080`
3. Register a test Azure App with `http://localhost:8080` as redirect URI
4. Update `clientId` and `redirectUri` in `script.js`
5. Open browser DevTools (F12) and check Console for errors
6. Test authentication flow, file picking, save operations, and new features:
   - Create new file with "New" button
   - Edit text and verify dirty flag prevents accidental close
   - Toggle word wrap with "WW" button
   - Use "Save As" to save new file to a specific folder
   - Close file with "Close" button
   - Open existing file and use regular "Save" button

## Performance Considerations

- **Large Files**: CodeMirror may struggle with files >5MB; no streaming support currently
- **Network**: Slow connections will make file operations sluggish (no retry logic)
- **Mobile Memory**: Keep number of cached modes low to save memory

## Security Notes

- Client ID is intentionally public (SPA best practice)
- All sensitive operations (auth, file uploads) use HTTPS
- Token stored only in session storage (cleared on browser close)
- No credentials or secrets hardcoded (Client ID is non-sensitive for public SPA)

## Related Resources

- **README.md**: User-facing setup and feature documentation
- **GEMINI.md**: Detailed architectural history and lessons learned
- **todo.txt**: Current bugs and feature requests
- Microsoft Graph API docs: https://docs.microsoft.com/en-us/graph/
- MSAL.js docs: https://github.com/AzureAD/microsoft-authentication-library-for-js
- CodeMirror docs: https://codemirror.net/5/
