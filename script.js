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
const newFileButton = document.getElementById('new-file-button');
const saveAsButton = document.getElementById('save-as-button');
const closeFileButton = document.getElementById('close-file-button');
const wordWrapButton = document.getElementById('word-wrap-button');
const saveAsContainer = document.getElementById('save-as-container');
const saveAsFilenameInput = document.getElementById('save-as-filename');
const saveAsConfirmButton = document.getElementById('save-as-confirm-button');

let editor;
let currentFile = null;
let isDirty = false;
let isSaveAs = false;
let currentFolderId = 'root';

// Initialize CodeMirror
editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "material-darker",
    readOnly: true,
    lineWrapping: false // Word wrap is off by default
});

editor.on("change", () => {
    isDirty = true;
});

// --- New File Management Functions ---
function newFile() {
    if (isDirty && !confirm("You have unsaved changes. Are you sure you want to start a new file?")) {
        return;
    }
    currentFile = { name: "Untitled.txt", id: null }; // Temporary file object
    editor.setValue("");
    setTimeout(() => editor.refresh(), 1); // Force a refresh to fix layout issues
    editor.setOption("readOnly", false);
    fileInfo.textContent = "Editing: " + currentFile.name;
    saveFileButton.disabled = true; // Cannot save a new file without a path
    saveAsButton.disabled = false;
    closeFileButton.disabled = false;
    isDirty = false;
}

function closeFile() {
    if (isDirty && !confirm("You have unsaved changes. Are you sure you want to close the file?")) {
        return;
    }
    currentFile = null;
    editor.setValue("");
    editor.setOption("readOnly", true);
    fileInfo.textContent = "No file selected.";
    saveFileButton.disabled = true;
    saveAsButton.disabled = true;
    closeFileButton.disabled = true;
    isDirty = false;
}

function toggleWordWrap() {
    const isWrapping = editor.getOption("lineWrapping");
    editor.setOption("lineWrapping", !isWrapping);
    wordWrapButton.style.backgroundColor = !isWrapping ? '#a0a0a0' : '#e0e0e0';
}

// --- MSAL Authentication ---
function updateUI() { /* Unchanged */ }
function signIn() { msalInstance.loginRedirect({ scopes: ["User.Read", "Files.ReadWrite"] }); }
function signOut() { /* Unchanged */ }
async function getToken() { /* Unchanged */ }

// --- New Graph API File Picker ---
async function showFilePicker(folderId = 'root', parentId = null) {
    const token = await getToken();
    if (!token) return;

    currentFolderId = folderId.startsWith('items/') ? folderId.substring(6) : folderId;
    fileList.innerHTML = '<li>Loading...</li>';
    modal.classList.remove('modal-hidden');
    saveAsContainer.style.display = isSaveAs ? 'flex' : 'none';
    if (isSaveAs) {
        saveAsFilenameInput.value = currentFile?.name || 'Untitled.txt';
    }

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
            if (isSaveAs && item.file) {
                listItem.classList.add('disabled'); // Disable files in Save As mode
            } else {
                listItem.onclick = () => handleItemClick(item);
            }
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
    } else if (!isSaveAs) {
        // If it's a file and not in Save As mode, load it
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
        setTimeout(() => editor.refresh(), 1); // Force a refresh to fix layout issues
        editor.setOption("readOnly", false);
        saveFileButton.disabled = false;
        closeFileButton.disabled = false;
        saveAsButton.disabled = false;
        fileInfo.textContent = `Editing: ${currentFile.name}`;
        isDirty = false;

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
    isSaveAs = false; // Reset Save As mode on close
}

async function saveFile() {
    if (!currentFile) return;

    // If the file is new (has no ID), force a "Save As" flow
    if (!currentFile.id) {
        isSaveAs = true;
        showFilePicker();
        return;
    }

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
            isDirty = false; // Reset dirty flag
        } else { 
            const error = await response.json(); 
            alert(`Error saving file: ${error.error.message}`); 
        }
    } catch (error) {
        console.error(error);
    }
}

async function saveFileAs() {
    const filename = saveAsFilenameInput.value;
    if (!filename) {
        alert("Please enter a filename.");
        return;
    }

    const token = await getToken();
    if (!token) return;

    const content = editor.getValue();
    // Use the Graph API endpoint for creating a new file in a specific folder
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${currentFolderId}:/${filename}:/content`;

    try {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "text/plain" },
            body: content
        });

        if (response.ok) {
            alert("File saved successfully!");
            const newFileData = await response.json();
            currentFile = newFileData; // Update currentFile with the new file's metadata
            isDirty = false;
            isSaveAs = false;
            fileInfo.textContent = `Editing: ${currentFile.name}`;
            saveFileButton.disabled = false; // Enable the regular save button now
            closeModal();
        } else {
            const error = await response.json();
            alert(`Error saving file: ${error.error.message}`);
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred while saving the file.");
    }
}

// --- Event Listeners & Initialization ---
openFileButton.addEventListener('click', () => {
    isSaveAs = false;
    showFilePicker();
});
saveAsButton.addEventListener('click', () => {
    if (saveAsButton.disabled) return;
    isSaveAs = true;
    showFilePicker();
});
saveAsConfirmButton.addEventListener('click', saveFileAs);
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
newFileButton.addEventListener("click", newFile);
closeFileButton.addEventListener("click", closeFile);
wordWrapButton.addEventListener("click", toggleWordWrap);

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
        if (response.ok) {
            alert("File saved successfully!");
            isDirty = false; // Reset dirty flag
        } else { 
            const error = await response.json(); 
            alert(`Error saving file: ${error.error.message}`); 
        }
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