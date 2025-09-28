# OneDrive PWA Text Editor

A simple, fast, and lightweight Progressive Web App (PWA) optimized for mobile devices (especially iPhone) to perform quick edits on text files stored in Microsoft OneDrive.

This application solves the common problem of needing to make a small change to a configuration file, code snippet, or note on the go, without the cumbersome process of downloading, editing in a separate app, and re-uploading the file.

**Live Demo:** [https://greenwh.github.io/cloud_file_text_editor/](https://greenwh.github.io/cloud_file_text_editor/)

## Features

-   **Lightweight & Fast**: Built with vanilla JavaScript and lightweight libraries for a responsive mobile experience.
-   **Progressive Web App (PWA)**: Can be "installed" to your device's home screen for an app-like experience and offline caching.
-   **Secure Microsoft Authentication**: Uses the official Microsoft Authentication Library (MSAL.js) with an OAuth 2.0 redirect flow for secure sign-in.
-   **Direct OneDrive Integration**: Uses the Microsoft Graph API to browse your OneDrive folders and directly fetch/save file content.
-   **Syntax Highlighting**: Leverages CodeMirror to provide automatic language detection and syntax highlighting for common file types (`.py`, `.js`, `.html`, `.css`, `.md`, etc.).
-   **Core Editing Features**: Includes essential cut, copy, and paste functionality within a mobile-friendly editor.

## Getting Started: Setup and Installation

To run your own instance of this application, you must register it with the Microsoft identity platform. This is a **free process** that can be done with any personal Microsoft account (the same kind you use for OneDrive or Outlook.com).

### Step 1: Register Your Application in the Azure Portal

This process gives your application a unique ID so Microsoft can identify it.

1.  **Navigate to App Registrations**: Go to the [Azure portal - App registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) page and sign in with your Microsoft account.
2.  **New Registration**: Click on **+ New registration**.
3.  **Name Your App**: Give it a descriptive name, such as "My OneDrive Text Editor".
4.  **Set the Account Type**: This is a critical step. Under "Supported account types," select:
    > **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**
5.  **Configure the Redirect URI**:
    -   Under the "Redirect URI" section, select **Single-page application (SPA)** from the dropdown.
    -   Enter the exact URL where you will host the application. For the demo, this is `https://greenwh.github.io/cloud_file_text_editor/`. If running locally for testing, you might use `http://localhost:8080`.
    -   **Important**: The URL must be an exact match, including any trailing slashes.
6.  **Register**: Click the **Register** button at the bottom.
7.  **Copy Your Client ID**: On the application's "Overview" page, find the **Application (client) ID** and copy it. You will need this in the next step.

### Step 2: Configure the Application Code

1.  Open the `script.js` file in the project.
2.  Find the following line at the top of the file:
    ```javascript
    const clientId = "YOUR_CLIENT_ID_HERE";
    ```
3.  Replace `"YOUR_CLIENT_ID_HERE"` with the **Application (client) ID** you copied from the Azure portal.

### Step 3: Deploy or Run Locally

-   **Deploy**: You can deploy the folder containing all the files (`index.html`, `script.js`, etc.) to a static web host like GitHub Pages, Netlify, or Vercel.
-   **Run Locally**: To test on your own machine, you can use any simple web server. If you have Node.js installed, you can use the `http-server` package:
    ```bash
    # Install the server globally
    npm install -g http-server

    # Navigate to the project directory and start the server
    cd path/to/your/project
    http-server
    ```

## Technology Stack

-   **HTML5 / CSS3 / JavaScript (ES6+)**
-   **Progressive Web App (PWA)**: Manifest and Service Worker for offline capabilities.
-   **Microsoft Authentication Library (MSAL.js)**: For handling secure user authentication.
-   **Microsoft Graph API**: For all interactions with OneDrive (listing folders, reading/writing files).
-   **CodeMirror**: A versatile and lightweight in-browser code and text editor.