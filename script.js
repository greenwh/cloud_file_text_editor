// =================================================================
// SCRIPT - Uses CodeMirror 6 and MS Graph API for File Picking
// =================================================================

// Import CodeMirror 6 modules
import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { php } from "@codemirror/lang-php";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { selectAll } from "@codemirror/commands";

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
const selectAllButton = document.getElementById('select-all-button');
const saveAsContainer = document.getElementById('save-as-container');
const saveAsFilenameInput = document.getElementById('save-as-filename');
const saveAsConfirmButton = document.getElementById('save-as-confirm-button');
const editorContainer = document.getElementById('editor-container');

let editor;
let currentFile = null;
let isDirty = false;
let isSaveAs = false;
let currentFolderId = 'root';

// Compartments for dynamic configuration
const languageCompartment = new Compartment();
const readOnlyCompartment = new Compartment();
const lineWrappingCompartment = new Compartment();

// Track word wrap state
let isWordWrapEnabled = false;

// Initialize CodeMirror 6
const startState = EditorState.create({
    doc: "",
    extensions: [
        basicSetup,
        oneDark,
        languageCompartment.of([]),
        readOnlyCompartment.of(EditorState.readOnly.of(true)),
        lineWrappingCompartment.of([]), // Start with wrapping disabled
        EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                isDirty = true;
            }
        })
    ]
});

editor = new EditorView({
    state: startState,
    parent: editorContainer
});

// Language map for file extensions
const languageMap = {
    'js': javascript,
    'jsx': javascript,
    'ts': javascript,
    'tsx': javascript,
    'md': markdown,
    'markdown': markdown,
    'py': python,
    'html': html,
    'htm': html,
    'css': css,
    'json': json,
    'xml': xml,
    'svg': xml,
    'php': php,
    'java': java,
    'cpp': cpp,
    'c': cpp,
    'h': cpp,
    'hpp': cpp,
    'rs': rust,
    'sql': sql,
};

// Get language extension for file
function getLanguageExtension(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const langFunc = languageMap[extension];
    return langFunc ? langFunc() : [];
}

// --- New File Management Functions ---
function newFile() {
    if (isDirty && !confirm("You have unsaved changes. Are you sure you want to start a new file?")) {
        return;
    }
    currentFile = { name: "Untitled.txt", id: null };

    editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: "" },
        effects: [
            readOnlyCompartment.reconfigure(EditorState.readOnly.of(false)),
            languageCompartment.reconfigure([])
        ]
    });

    fileInfo.textContent = "Editing: " + currentFile.name;
    saveFileButton.disabled = true;
    saveAsButton.disabled = false;
    closeFileButton.disabled = false;
    selectAllButton.disabled = false;
    isDirty = false;
}

function closeFile() {
    if (isDirty && !confirm("You have unsaved changes. Are you sure you want to close the file?")) {
        return;
    }
    currentFile = null;

    editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: "" },
        effects: [
            readOnlyCompartment.reconfigure(EditorState.readOnly.of(true)),
            languageCompartment.reconfigure([])
        ]
    });

    fileInfo.textContent = "No file selected.";
    saveFileButton.disabled = true;
    saveAsButton.disabled = true;
    closeFileButton.disabled = true;
    selectAllButton.disabled = true;
    isDirty = false;
}

function toggleWordWrap() {
    isWordWrapEnabled = !isWordWrapEnabled;
    editor.dispatch({
        effects: lineWrappingCompartment.reconfigure(
            isWordWrapEnabled ? EditorView.lineWrapping : []
        )
    });
    wordWrapButton.style.backgroundColor = isWordWrapEnabled ? '#a0a0a0' : '#e0e0e0';
}

function selectAllText() {
    selectAll(editor);
    editor.focus();
}

// --- MSAL Authentication ---
function signIn() {
    msalInstance.loginRedirect({ scopes: ["User.Read", "Files.ReadWrite"] });
}

function signOut() {
    const logoutRequest = {
        account: msalInstance.getActiveAccount(),
        postLogoutRedirectUri: msalConfig.auth.redirectUri,
    };
    msalInstance.logoutRedirect(logoutRequest);
}

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
        fileList.innerHTML = '';

        // Add 'Go Up' item if not in the root
        if (folderId !== 'root' && parentId) {
            const parentItem = document.createElement('li');
            parentItem.textContent = '..';
            parentItem.className = 'parent';
            parentItem.onclick = () => showFilePicker(`items/${parentId}`, null);
            fileList.appendChild(parentItem);
        }

        // Add folders and files
        data.value.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item.name;
            listItem.className = item.folder ? 'folder' : 'file';
            if (isSaveAs && item.file) {
                listItem.classList.add('disabled');
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
        showFilePicker(`items/${item.id}`, item.parentReference.id);
        modalPath.textContent = item.name;
    } else if (!isSaveAs) {
        loadFile(item);
        closeModal();
    }
}

async function loadFile(fileItem) {
    const token = await getToken();
    if (!token) return;

    currentFile = fileItem;
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${fileItem.id}/content`;

    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to download file.');

        const text = await response.text();
        const langExtension = getLanguageExtension(currentFile.name);

        editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: text },
            effects: [
                readOnlyCompartment.reconfigure(EditorState.readOnly.of(false)),
                languageCompartment.reconfigure(langExtension)
            ]
        });

        saveFileButton.disabled = false;
        closeFileButton.disabled = false;
        saveAsButton.disabled = false;
        selectAllButton.disabled = false;
        fileInfo.textContent = `Editing: ${currentFile.name}`;
        isDirty = false;
    } catch (error) {
        console.error(error);
        alert('Error loading file content.');
    }
}

function closeModal() {
    modal.classList.add('modal-hidden');
    modalPath.textContent = 'OneDrive';
    isSaveAs = false;
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

    const content = editor.state.doc.toString();
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${currentFile.id}/content`;

    try {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "text/plain" },
            body: content
        });
        if (response.ok) {
            alert("File saved successfully!");
            isDirty = false;
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

    const content = editor.state.doc.toString();
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
            currentFile = newFileData;
            isDirty = false;
            isSaveAs = false;
            fileInfo.textContent = `Editing: ${currentFile.name}`;
            saveFileButton.disabled = false;
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
selectAllButton.addEventListener("click", selectAllText);

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
