// Replace with your own Client ID
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
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        signinButton.style.display = "none";
        signoutButton.style.display = "block";
        mainContent.style.display = "flex";
    } else {
        signinButton.style.display = "block";
        signoutButton.style.display = "none";
        mainContent.style.display = "none";
    }
}

async function signIn() {
    try {
        await msalInstance.loginPopup({
            scopes: ["User.Read", "Files.ReadWrite"]
        });
        updateUI();
    } catch (error) {
        console.error(error);
    }
}

function signOut() {
    const logoutRequest = {
        account: msalInstance.getAllAccounts()[0]
    };
    msalInstance.logoutPopup(logoutRequest);
    updateUI();
}

async function getToken() {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        return null;
    }
    const request = {
        scopes: ["User.Read", "Files.ReadWrite"],
        account: accounts[0]
    };
    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
            return msalInstance.acquireTokenPopup(request).then(response => response.accessToken);
        }
        console.error(error);
        return null;
    }
}

async function openFile() {
    console.log("Attempting to open a file...");
    const token = await getToken();
    if (!token) {
        alert("Could not get access token.");
        console.error("Failed to get access token.");
        return;
    }
    console.log("Access token acquired successfully.");

    const odOptions = {
        clientId: clientId,
        action: "query",
        multiSelect: false,
        advanced: {
            redirectUri: "https://greenwh.github.io/cloud_file_text_editor/",
            endpointHint: "api.onedrive.com",
            accessToken: token,
            scopes: ["Files.ReadWrite"]
        },
        success: async (files) => {
            console.log("OneDrive picker success callback triggered.");
            // LOG 1: See the entire raw response from the picker
            console.log("Full response from picker:", files);

            if (files.value && files.value.length > 0) {
                const file = files.value[0];
                // LOG 2: See the specific file object we are trying to use
                console.log("Selected file object:", file);

                currentFile = file;
                const downloadUrl = file["@microsoft.graph.downloadUrl"];
                // LOG 3: See the exact URL we are about to download from
                console.log("Using download URL:", downloadUrl);

                if (!downloadUrl) {
                    alert("Error: The selected file does not have a download URL. This can happen with folders or special items.");
                    console.error("Missing @microsoft.graph.downloadUrl property on file object.");
                    return;
                }

                try {
                    const response = await fetch(downloadUrl);
                    const text = await response.text();
                    
                    if (response.ok) {
                        editor.setValue(text);
                        editor.setOption("readOnly", false);
                        saveFileButton.disabled = false;
                        fileInfo.textContent = `Editing: ${file.name}`;

                        // Auto-detect and set mode
                        const modeInfo = CodeMirror.findModeByExtension(file.name.split('.').pop());
                        if (modeInfo) {
                            CodeMirror.modeURL = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/%N/%N.min.js";
                            CodeMirror.requireMode(modeInfo.mode, () => {
                                editor.setOption("mode", modeInfo.mime);
                            });
                        } else {
                            editor.setOption("mode", null);
                        }
                    } else {
                        alert(`Failed to download file. Status: ${response.status}`);
                        console.error("Failed to fetch file content.", text);
                    }
                } catch (error) {
                    alert("An error occurred while fetching the file content.");
                    console.error("Fetch request failed:", error);
                }
            } else {
                console.warn("Picker success callback was called, but no files were selected or returned in the 'value' array.");
            }
        },
        cancel: () => {
            console.log("File picker was cancelled.");
        },
        error: (e) => {
            console.error("OneDrive picker returned an error:", e);
            alert("An error occurred with the OneDrive file picker.");
        }
    };

    OneDrive.open(odOptions);
}

async function saveFile() {
    if (!currentFile) {
        alert("No file is currently open.");
        return;
    }

    const token = await getToken();
    if (!token) {
        alert("Could not get access token.");
        return;
    }

    const content = editor.getValue();
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${currentFile.id}/content`;

    try {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "text/plain"
            },
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
        alert("An error occurred while saving the file.");
    }
}

// Event Listeners
signinButton.addEventListener("click", signIn);
signoutButton.addEventListener("click", signOut);
openFileButton.addEventListener("click", openFile);
saveFileButton.addEventListener("click", saveFile);

// Initial UI update
updateUI();

// Load OneDrive File Picker SDK
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://js.live.net/v7.2/OneDrive.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'onedrive-js'));

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}