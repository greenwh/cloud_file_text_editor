# OneDrive PWA Text Editor

A simple, fast, and lightweight Progressive Web App (PWA) optimized for mobile devices to perform quick edits on text files stored in Microsoft OneDrive.

This application solves the common problem of needing to make a small change to a configuration file, code snippet, or note on the go, without the cumbersome process of downloading, editing in a separate app, and re-uploading the file. The UI is designed for a mobile-first, vertical orientation with a compact control bar and a full-screen editor.

**Live Demo:** [https://greenwh.github.io/cloud_file_text_editor/](https://greenwh.github.io/cloud_file_text_editor/)

## Features

-   **Mobile-First UI**: The user interface is specifically designed for vertical phone screens, with a compact, single-line control bar and a full-height text editor.
-   **Full File Management**: Create new files, open existing ones, save changes, and use "Save As" to create copies or save untitled files to a specific OneDrive location.
-   **Word Wrap**: Easily toggle word wrapping for a better reading and editing experience on small screens.
-   **Unsaved Changes Protection**: The app will prompt you to save your work before closing a file with unsaved changes, preventing data loss.
-   **Lightweight & Fast**: Built with vanilla JavaScript for a responsive mobile experience.
-   **Progressive Web App (PWA)**: Can be "installed" to your device's home screen for an app-like experience and offline caching.
-   **Secure Microsoft Authentication**: Uses the official Microsoft Authentication Library (MSAL.js) for secure sign-in.
-   **Direct OneDrive Integration**: Uses the Microsoft Graph API to browse folders and directly fetch/save file content.
-   **Syntax Highlighting**: Leverages CodeMirror to provide automatic language detection and syntax highlighting for common file types.

## Getting Started: Setup and Installation

To run your own instance of this application, you must register it with the Microsoft identity platform. This is a **free process** that can be done with any personal Microsoft account.

### Step 1: Register Your Application in the Azure Portal

1.  **Navigate to App Registrations**: Go to the [Azure portal - App registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) and sign in.
2.  **New Registration**: Click on **+ New registration**.
3.  **Name Your App**: Give it a descriptive name, such as "My OneDrive Text Editor".
4.  **Set the Account Type**: Select **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**.
5.  **Configure the Redirect URI**:
    -   Select **Single-page application (SPA)**.
    -   Enter the exact URL where you will host the application (e.g., `https://your-github-username.github.io/your-repo/` or `http://localhost:8080` for testing).
6.  **Register**: Click the **Register** button.
7.  **Copy Your Client ID**: On the application's "Overview" page, copy the **Application (client) ID**.

### Step 2: Configure the Application Code

1.  Open the `script.js` file.
2.  Find the `const clientId = "..."` line at the top.
3.  Replace the existing client ID with the one you copied from the Azure portal.

### Step 3: Deploy or Run Locally

-   **Deploy**: Deploy the folder to a static web host like GitHub Pages, Netlify, or Vercel.
-   **Run Locally**: Use a simple web server. With Node.js installed:
    ```bash
    # Install the server globally
    npm install -g http-server

    # Navigate to the project directory and start the server
    cd path/to/your/project
    http-server
    ```

## Technology Stack

-   **HTML5 / CSS3 / JavaScript (ES6+)**
-   **Progressive Web App (PWA)**: Manifest and Service Worker.
-   **Microsoft Authentication Library (MSAL.js)**: For secure user authentication.
-   **Microsoft Graph API**: For all interactions with OneDrive.
-   **CodeMirror**: A versatile in-browser code and text editor.
