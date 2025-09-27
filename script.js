// =================================================================
// FINAL SCRIPT - Uses Redirect Flow
// =================================================================

// PASTE YOUR OWN CLIENT ID HERE
const clientId = "72445ccf-a776-4d59-a35e-eb790a5db442";

const msalConfig = {
    auth: {
        clientId: clientId,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "https://greenwh.github.io/cloud_file_text_editor/"
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const signinButton = document.getElementById("signin-button");
const signoutButton = document.getElementById("signout-button");
const mainContent = document.getElementById("main-content");
const openFileButton = document.getElementById("open-file-button");
const saveFileButton = document.getElementById("save-file-button");
const fileInfo = document.getElementById("file-info");

let editor;
let currentFile = null;

// Initialize CodeMirror
editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "material-darker",
    readOnly: true
});

function updateUI() {
    const account = msalInstance.getActiveAccount();
    if (account) {
        signinButton.style.display = "none";
        signoutButton.style.display = "block";
        mainContent.style.display = "flex";
    } else {
        signinButton.style.display = "block";
        signoutButton.style.display = "none";
        mainContent.style.display = "none";
    }
}

function signIn() {
    msalInstance.loginRedirect({
        scopes: ["User.Read", "Files.ReadWrite"]
    });
}

function signOut() {
    const logoutRequest = {
        account: msalInstance.getActiveAccount()
    };
    msalInstance.logoutRedirect(logoutRequest);
}

async function getToken() {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        return null;
    }
    const request = {
        scopes: ["User.Read", "Files.ReadWrite"],
        account: account
    };
    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to redirect
            msalInstance.acquireTokenRedirect(request);
        } else {
            console.error(error);
        }
        return null;
    }
}

async function openFile() {
    const token = await getToken();
    if (!token) {
        console.error("Could not acquire token for file open.");
        return;
    }

    const odOptions = {
        clientId: clientId,
        action: "query",
        multiSelect: false,
        advanced: {
            redirectUri: "https://greenwh.github.io/cloud_file_text_editor/",
            accessToken: token, // Pass the token directly
            scopes: ["Files.Read"]
        },
        success: async (files) => {
            if (files.value && files.value.length > 0) {
                const file = files.value[0];
                currentFile = file;

                if (!file.id) {
                    alert("Error: Could not get the ID of the selected file.");
                    return;
                }

                const downloadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/content`;

                try {
                    const freshToken = await getToken(); // Get a fresh token just in case
                    if (!freshToken) return;

                    const response = await fetch(downloadUrl, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${freshToken}` }
                    });
                    
                    if (response.ok) {
                        const text = await response.text();
                        editor.setValue(text);
                        editor.setOption("readOnly", false);
                        saveFileButton.disabled = false;
                        fileInfo.textContent = `Editing: ${file.name}`;

                        const modeInfo = CodeMirror.findModeByExtension(file.name.split('.').pop());
                        if (modeInfo) {
                            CodeMirror.modeURL = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/%N/%N.min.js";
                            CodeMirror.requireMode(modeInfo.mode, () => {
                                editor.setOption("mode", modeInfo.mime);
                            });
                        }
                    } else {
                        const error = await response.json();
                        alert(`Error downloading file: ${error.error.message}`);
                    }
                } catch (error) {
                    console.error("Fetch request failed:", error);
                }
            }
        },
        cancel: () => {},
        error: (e) => {
            console.error("OneDrive picker returned an error:", e);
        }
    };

    OneDrive.open(odOptions);
}

async function saveFile() {
    if (!currentFile) return;
    const token = await getToken();
    if (!token) return;

    const content = editor.getValue();
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${currentFile.id}/content`;

    try {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "text/plain" },
            body: content
        });
        if (response.ok) {
            alert("File saved successfully!");
        } else {
            const error = await response.json();
            alert(`Error saving file: ${error.error.message}`);
        }
    } catch (error) {
        console.error(error);
    }
}

// Handle the redirect promise
msalInstance.handleRedirectPromise().then((response) => {
    if (response) {
        msalInstance.setActiveAccount(response.account);
    }
    updateUI();
}).catch((error) => {
    console.error(error);
});

// Event Listeners
signinButton.addEventListener("click", signIn);
signoutButton.addEventListener("click", signOut);
openFileButton.addEventListener("click", openFile);
saveFileButton.addEventListener("click", saveFile);

// Load OneDrive File Picker SDK
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://js.live.net/v7.2/OneDrive.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'onedrive-js'));

// Service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js', { scope: './' }).then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}