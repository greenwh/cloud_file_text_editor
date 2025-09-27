// =================================================================
// FINAL SCRIPT - Uses MS Graph API for File Picking
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

// DOM Elements
const signinButton = document.getElementById("signin-button");
const signoutButton = document.getElementById("signout-button");
const mainContent = document.getElementById("main-content");
const openFileButton = document.getElementById("open-file-button");
const saveFileButton = document.getElementById("save-file-button");
const fileInfo = document.getElementById("file-info");
const modal = document.getElementById('file-picker-modal');
const modalCloseButton = document.getElementById('modal-close-button');
const fileList = document.getElementById('file-list');
const modalPath = document.getElementById('modal-path');

let editor;
let currentFile = null;

// Initialize CodeMirror
editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "material-darker",
    readOnly: true
});

// --- MSAL Authentication ---
function updateUI() { /* Unchanged */ }
function signIn() { msalInstance.loginRedirect({ scopes: ["User.Read", "Files.ReadWrite"] }); }
function signOut() { /* Unchanged */ }
async function getToken() { /* Unchanged */ }

// --- New Graph API File Picker ---
async function showFilePicker(folderId = 'root', parentId = null) {
    const token = await getToken();
    if (!token) return;

    fileList.innerHTML = '<li>Loading...</li>';
    modal.classList.remove('modal-hidden');

    const url = `https://graph.microsoft.com/v1.0/me/drive/${folderId}/children?$select=id,name,folder,file,parentReference`;
    
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch files.');

        const data = await response.json();
        fileList.innerHTML = ''; // Clear loading message

        // Add 'Go Up' item if not in the root
        if (folderId !== 'root' && parentId) {
            const parentItem = document.createElement('li');
            parentItem.textContent = '..';
            parentItem.className = 'parent';
            parentItem.onclick = () => showFilePicker(`items/${parentId}`, null); // Simplified parent navigation
            fileList.appendChild(parentItem);
        }

        // Add folders and files
        data.value.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item.name;
            listItem.className = item.folder ? 'folder' : 'file';
            listItem.onclick = () => handleItemClick(item);
            fileList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
        fileList.innerHTML = '<li>Error loading files.</li>';
    }
}

function handleItemClick(item) {
    if (item.folder) {
        // If it's a folder, navigate into it
        showFilePicker(`items/${item.id}`, item.parentReference.id);
        modalPath.textContent = item.name;
    } else {
        // If it's a file, load it
        loadFile(item);
        closeModal();
    }
}

async function loadFile(fileItem) {
    const token = await getToken();
    if (!token) return;

    currentFile = fileItem; // Save file metadata
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${fileItem.id}/content`;
    
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to download file.');

        const text = await response.text();
        editor.setValue(text);
        editor.setOption("readOnly", false);
        saveFileButton.disabled = false;
        fileInfo.textContent = `Editing: ${currentFile.name}`;

        const modeInfo = CodeMirror.findModeByExtension(currentFile.name.split('.').pop());
        if (modeInfo) {
            CodeMirror.modeURL = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/%N/%N.min.js";
            CodeMirror.requireMode(modeInfo.mode, () => editor.setOption("mode", modeInfo.mime));
        }
    } catch (error) {
        console.error(error);
        alert('Error loading file content.');
    }
}

function closeModal() {
    modal.classList.add('modal-hidden');
    modalPath.textContent = 'OneDrive';
}

async function saveFile() { /* Unchanged */ }

// --- Event Listeners & Initialization ---
openFileButton.addEventListener('click', () => showFilePicker());
modalCloseButton.addEventListener('click', closeModal);

// Handle the redirect promise
msalInstance.handleRedirectPromise().then((response) => {
    if (response) msalInstance.setActiveAccount(response.account);
    updateUI();
}).catch((error) => console.error(error));

// Add other listeners and initial calls
signinButton.addEventListener("click", signIn);
signoutButton.addEventListener("click", signOut);
saveFileButton.addEventListener("click", saveFile);

// Service worker registration
if ('serviceWorker' in navigator) { /* Unchanged */ }

// Unchanged functions (to save space, copy from your working file)
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

async function getToken() {
    const account = msalInstance.getActiveAccount();
    if (!account) return null;
    const request = { scopes: ["User.Read", "Files.ReadWrite"], account: account };
    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
            msalInstance.acquireTokenRedirect(request);
        }
        return null;
    }
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
        if (response.ok) alert("File saved successfully!");
        else { const error = await response.json(); alert(`Error saving file: ${error.error.message}`); }
    } catch (error) {
        console.error(error);
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js', { scope: './' }).then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}