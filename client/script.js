// import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

// // ⭐️ Connect with autoConnect set to false
// const socket = io('http://127.0.0.1:5000', { autoConnect: false });

// // --- DOM ELEMENTS ---
// const mainContainer = document.querySelector('.main-container');
// const nameOverlay = document.getElementById('name-overlay');
// const nameInput = document.getElementById('name-input');
// const nameSubmitBtn = document.getElementById('name-submit-btn');
// const writingArea = document.getElementById('text-input');
// const optionsButtons = document.querySelectorAll(".option-button");
// const advancedOptions = document.querySelectorAll(".adv-option-button");
// const canvas = document.getElementById('drawing-canvas');
// const context = canvas.getContext('2d');
// const penColorInput = document.getElementById('pen-color');
// const penWidthInput = document.getElementById('pen-width');
// const clearCanvasBtn = document.getElementById('clear-canvas-btn');
// const userList = document.getElementById('user-list');
// const typingIndicator = document.getElementById('typing-indicator');
// const note = document.getElementById('note');

// // --- INITIAL SETUP ---
// let lastText = '';

// // ⭐️ This new logic handles the custom modal INSTEAD of the prompt
// nameSubmitBtn.addEventListener('click', handleJoin);
// nameInput.addEventListener('keydown', (e) => {
//     if (e.key === 'Enter') {
//         handleJoin();
//     }
// });

// function handleJoin() {
//     const userName = nameInput.value.trim();
//     if (userName) {
//         // Hide the modal
//         nameOverlay.classList.remove('visible');
//         mainContainer.style.filter = 'none';

//         // Set the username in auth and connect to the server
//         socket.auth = { username: userName };
//         socket.connect();
//     } else {
//         alert("Please enter a name.");
//     }
// }


// // Set canvas size
// function resizeCanvas() {
//     const dpr = window.devicePixelRatio || 1;
//     const rect = canvas.getBoundingClientRect();
//     canvas.width = rect.width * dpr;
//     canvas.height = rect.height * dpr;
//     context.scale(dpr, dpr);
// }
// window.addEventListener('load', resizeCanvas);
// window.addEventListener('resize', resizeCanvas);


// // =================================================================
// // SECTION 1: RICH TEXT EDITOR LOGIC
// // =================================================================
// const modifyText = (command, defaultUi, value) => {
//     document.execCommand(command, defaultUi, value);
// };
// optionsButtons.forEach(button => {
//     button.addEventListener("click", () => modifyText(button.id, false, null));
// });
// advancedOptions.forEach(button => {
//     button.addEventListener("change", () => modifyText(button.id, false, button.value));
// });
// document.getElementById("createLink").addEventListener("click", () => {
//     let userLink = prompt("Enter a URL");
//     if (userLink) modifyText("createLink", false, userLink);
// });
// writingArea.addEventListener('input', () => {
//     const currentText = writingArea.innerHTML;
//     if (currentText !== lastText) {
//         socket.emit('text-edited', currentText);
//         socket.emit('typing');
//         lastText = currentText;
//     }
// });
// socket.on('receive-changes', (text) => {
//     if (writingArea.innerHTML !== text) {
//         writingArea.innerHTML = text;
//         lastText = text;
//     }
// });


// // =================================================================
// // SECTION 2: DRAWING CANVAS LOGIC
// // =================================================================
// let isDrawing = false;
// let lastX = 0;
// let lastY = 0;
// function getMousePos(canvas, evt) {
//     const rect = canvas.getBoundingClientRect();
//     return {
//       x: evt.clientX - rect.left,
//       y: evt.clientY - rect.top
//     };
// }
// function drawLine(x0, y0, x1, y1, color, width, emit = false) {
//     context.beginPath();
//     context.moveTo(x0, y0);
//     context.lineTo(x1, y1);
//     context.strokeStyle = color;
//     context.lineWidth = width;
//     context.lineCap = 'round';
//     context.stroke();
//     context.closePath();
//     if (!emit) return;
//     socket.emit('drawing', { x0, y0, x1, y1, color, width });
// }
// canvas.addEventListener('mousedown', (e) => {
//     isDrawing = true;
//     const pos = getMousePos(canvas, e);
//     [lastX, lastY] = [pos.x, pos.y];
// });
// canvas.addEventListener('mousemove', (e) => {
//     if (!isDrawing) return;
//     const pos = getMousePos(canvas, e);
//     drawLine(lastX, lastY, pos.x, pos.y, penColorInput.value, penWidthInput.value, true);
//     [lastX, lastY] = [pos.x, pos.y];
// });
// canvas.addEventListener('mouseup', () => isDrawing = false);
// canvas.addEventListener('mouseout', () => isDrawing = false);
// clearCanvasBtn.addEventListener('click', () => {
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     socket.emit('clear-canvas');
// });
// socket.on('drawing', (data) => {
//     drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.width);
// });
// socket.on('clear-canvas', () => {
//     context.clearRect(0, 0, canvas.width, canvas.height);
// });


// // =================================================================
// // SECTION 3: GENERAL COLLABORATION FEATURES
// // =================================================================
// let typingTimeout = null;
// socket.on('user-typing', (name) => {
//     typingIndicator.textContent = `${name} is typing...`;
//     clearTimeout(typingTimeout);
//     typingTimeout = setTimeout(() => typingIndicator.textContent = '', 2000);
// });
// function updateUserList(users) {
//     userList.innerHTML = '';
//     for (const id in users) {
//         const name = users[id];
//         const userItem = document.createElement('div');
//         userItem.textContent = name;
//         if (id === socket.id) {
//             userItem.style.fontWeight = 'bold';
//             userItem.textContent += ' (You)';
//         }
//         userList.appendChild(userItem);
//     }
// }
// socket.on('update-user-list', (users) => updateUserList(users));
// function displayMessage(message, color = '0,255,0') {
//     const msgDiv = document.createElement('div');
//     msgDiv.style.backgroundColor = `rgba(${color}, 0.5)`;
//     msgDiv.textContent = message;
//     note.appendChild(msgDiv);
//     setTimeout(() => msgDiv.remove(), 3000);
// }
// socket.on('user-connected', (name) => displayMessage(`${name} connected`));
// socket.on('user-disconnected', (name) => displayMessage(`${name} disconnected`, '255,0,0'));

import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

// ⭐️ Connect with autoConnect set to false
const socket = io('http://127.0.0.1:5000', { autoConnect: false });

// --- DOM ELEMENTS ---
const mainContainer = document.querySelector('.main-container');
const nameOverlay = document.getElementById('name-overlay');
const nameInput = document.getElementById('name-input');
const nameSubmitBtn = document.getElementById('name-submit-btn');
const writingArea = document.getElementById('text-input');
const optionsButtons = document.querySelectorAll(".option-button");
const advancedOptions = document.querySelectorAll(".adv-option-button");
const canvas = document.getElementById('drawing-canvas');
const context = canvas.getContext('2d');
const penColorInput = document.getElementById('pen-color');
const penWidthInput = document.getElementById('pen-width');
const clearCanvasBtn = document.getElementById('clear-canvas-btn');
const userList = document.getElementById('user-list');
const typingIndicator = document.getElementById('typing-indicator');
const note = document.getElementById('note');

// --- INITIAL SETUP ---
let lastText = '';

// This new logic handles the custom modal INSTEAD of the prompt
nameSubmitBtn.addEventListener('click', handleJoin);
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleJoin();
    }
});

function handleJoin() {
    const userName = nameInput.value.trim();
    if (userName) {
        // Hide the modal
        nameOverlay.classList.remove('visible');
        mainContainer.style.filter = 'none';

        // Set the username in auth and connect to the server
        socket.auth = { username: userName };
        socket.connect();
    } else {
        alert("Please enter a name.");
    }
}


// Set canvas size
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.scale(dpr, dpr);
}
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);


// =================================================================
// SECTION 1: RICH TEXT EDITOR LOGIC
// =================================================================
const modifyText = (command, defaultUi, value) => {
    document.execCommand(command, defaultUi, value);
};
optionsButtons.forEach(button => {
    button.addEventListener("click", () => modifyText(button.id, false, null));
});
advancedOptions.forEach(button => {
    button.addEventListener("change", () => modifyText(button.id, false, button.value));
});
document.getElementById("createLink").addEventListener("click", () => {
    let userLink = prompt("Enter a URL");
    if (userLink) modifyText("createLink", false, userLink);
});
writingArea.addEventListener('input', () => {
    const currentText = writingArea.innerHTML;
    if (currentText !== lastText) {
        socket.emit('text-edited', currentText);
        socket.emit('typing');
        lastText = currentText;
    }
});
socket.on('receive-changes', (text) => {
    if (writingArea.innerHTML !== text) {
        writingArea.innerHTML = text;
        lastText = text;
    }
});


// =================================================================
// SECTION 2: DRAWING CANVAS LOGIC
// =================================================================
let isDrawing = false;
let lastX = 0;
let lastY = 0;
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
function drawLine(x0, y0, x1, y1, color, width, emit = false) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.stroke();
    context.closePath();
    if (!emit) return;
    socket.emit('drawing', { x0, y0, x1, y1, color, width });
}
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getMousePos(canvas, e);
    [lastX, lastY] = [pos.x, pos.y];
});
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(canvas, e);
    drawLine(lastX, lastY, pos.x, pos.y, penColorInput.value, penWidthInput.value, true);
    [lastX, lastY] = [pos.x, pos.y];
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);
clearCanvasBtn.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-canvas');
});
socket.on('drawing', (data) => {
    drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.width);
});
socket.on('clear-canvas', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});


// =================================================================
// SECTION 3: GENERAL COLLABORATION FEATURES
// =================================================================
let typingTimeout = null;
socket.on('user-typing', (name) => {
    typingIndicator.textContent = `${name} is typing...`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => typingIndicator.textContent = '', 2000);
});
function updateUserList(users) {
    userList.innerHTML = '';
    for (const id in users) {
        const name = users[id];
        const userItem = document.createElement('div');
        userItem.textContent = name;
        if (id === socket.id) {
            userItem.style.fontWeight = 'bold';
            userItem.textContent += ' (You)';
        }
        userList.appendChild(userItem);
    }
}
socket.on('update-user-list', (users) => updateUserList(users));

function displayMessage(message, color = '0,255,0') {
    const msgDiv = document.createElement('div');
    msgDiv.style.backgroundColor = `rgba(${color}, 0.5)`;
    msgDiv.textContent = message;
    note.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 3000);
}

// ⭐️ ADDED: Cursor Tracking with Names
document.addEventListener('mousemove', (e) => {
    socket.emit('mouse-move', { x: e.pageX, y: e.pageY });
});

socket.on('mouse-move', ({ x, y, userId, username }) => {
    if (userId === socket.id) return; // Don't show your own cursor

    let cursor = document.getElementById(`cursor-${userId}`);
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${userId}`;
        cursor.className = 'cursor';
        // Create the cursor with a pointer icon (SVG) and a name label
        cursor.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 4.5L18.5 11.5L11.5 14.5L8.5 21.5L5.5 4.5Z" fill="#ffcc00" stroke="#000000" stroke-width="1" stroke-linejoin="round"/>
            </svg>
            <span class="cursor-name">${username}</span>
        `;
        document.body.appendChild(cursor);
    }
    // Update the cursor's position
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
});


socket.on('user-connected', (name) => displayMessage(`${name} connected`));
socket.on('user-disconnected', (name) => displayMessage(`${name} disconnected`, '255,0,0'));