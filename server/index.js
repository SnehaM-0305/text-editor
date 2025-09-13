

// const express = require('express');
// const app = express();
// const httpServer = require("http").createServer(app);
// const io = require("socket.io")(httpServer, {
//     cors: {
//         origin: "http://127.0.0.1:3000",
//         methods: ["GET", "POST"]
//     }
// });

// // --- STATE MANAGEMENT ---
// let users = {}; // e.g., { "socketId123": "Alice" }
// let documentContent = 'Start typing or drawing!';
// let documentLock = {
//     locked: false,
//     lockHolder: null,
// };

// // ⭐️ KEY FIX: Middleware to get username on initial connection
// // This runs for every new client before they are fully connected.
// io.use((socket, next) => {
//     const username = socket.handshake.auth.username;
//     if (!username || username.trim() === "") {
//         return next(new Error("Invalid username"));
//     }
//     // Attach the username to the socket object for later use
//     socket.username = username;
//     next();
// });

// io.on('connection', socket => {
//     console.log(`${socket.id} connected with username: ${socket.username}`);

//     // --- ACTIONS ON NEW CONNECTION ---
//     users[socket.id] = socket.username;
//     io.emit('user-connected', socket.username);
//     io.emit('update-user-list', users);
//     socket.emit('receive-changes', documentContent);
//     // Send current lock status to the new user
//     socket.emit('lock-status', { locked: documentLock.locked, lockHolder: documentLock.lockHolder });

//     // --- DISCONNECT HANDLER ---
//     socket.on('disconnect', () => {
//         const disconnectedUserName = users[socket.id];
//         console.log(`${disconnectedUserName} (${socket.id}) disconnected`);

//         if (disconnectedUserName) {
//             delete users[socket.id];

//             // If the disconnected user held the lock, release it
//             if (documentLock.lockHolder === socket.id) {
//                 documentLock.locked = false;
//                 documentLock.lockHolder = null;
//                 io.emit('lock-status', { locked: false, lockHolder: null });
//             }

//             io.emit('update-user-list', users);
//             io.emit('user-disconnected', disconnectedUserName);
//         }
//     });

//     // --- TEXT AND CONTENT HANDLERS ---
//     socket.on('text-edited', (text) => {
//         documentContent = text;
//         socket.broadcast.emit('receive-changes', text);
//     });

//     socket.on('typing', () => {
//         socket.broadcast.emit('user-typing', socket.username);
//     });

//     socket.on('highlight-text', (highlightData) => {
//         socket.broadcast.emit('highlight-text', highlightData);
//     });

//     socket.on('mouse-move', (data) => {
//         socket.broadcast.emit('mouse-move', data);
//     });

//     // --- DRAWING HANDLERS ---
//     socket.on('drawing', (data) => {
//         socket.broadcast.emit('drawing', data);
//     });

//     socket.on('clear-canvas', () => {
//         socket.broadcast.emit('clear-canvas');
//     });

//     // --- LOCKING LOGIC HANDLERS ---
//     socket.on('request-lock', (data) => {
//         if (!documentLock.locked) {
//             documentLock.locked = true;
//             documentLock.lockHolder = data.userId;
//             io.emit('lock-status', { locked: true, lockHolder: data.userId });
//         } else {
//             socket.emit('lock-status', { locked: true, lockHolder: documentLock.lockHolder });
//         }
//     });

//     socket.on('release-lock', (data) => {
//         if (documentLock.lockHolder === data.userId) {
//             documentLock.locked = false;
//             documentLock.lockHolder = null;
//             io.emit('lock-status', { locked: false, lockHolder: null });
//         }
//     });
// });

// // Start the server
// httpServer.listen(5000, () => {
//     console.log('Server listening on *:5000');
// });

const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://127.0.0.1:3000",
        methods: ["GET", "POST"]
    }
});

// --- STATE MANAGEMENT ---
let users = {};
let documentContent = 'Start typing or drawing!';
let documentLock = {
    locked: false,
    lockHolder: null,
};

// Middleware to get username on initial connection
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username || username.trim() === "") {
        return next(new Error("Invalid username"));
    }
    socket.username = username;
    next();
});

io.on('connection', socket => {
    console.log(`${socket.id} connected with username: ${socket.username}`);

    // --- Actions on New Connection ---
    users[socket.id] = socket.username;
    io.emit('user-connected', socket.username);
    io.emit('update-user-list', users);
    socket.emit('receive-changes', documentContent);
    socket.emit('lock-status', { locked: documentLock.locked, lockHolder: documentLock.lockHolder });

    // --- Disconnect Handler ---
    socket.on('disconnect', () => {
        const disconnectedUserName = users[socket.id];
        console.log(`${disconnectedUserName} (${socket.id}) disconnected`);

        if (disconnectedUserName) {
            delete users[socket.id];
            if (documentLock.lockHolder === socket.id) {
                documentLock.locked = false;
                documentLock.lockHolder = null;
                io.emit('lock-status', { locked: false, lockHolder: null });
            }
            io.emit('update-user-list', users);
            io.emit('user-disconnected', disconnectedUserName);
        }
    });

    // --- Text and Content Handlers ---
    socket.on('text-edited', (text) => {
        documentContent = text;
        socket.broadcast.emit('receive-changes', text);
    });

    socket.on('typing', () => {
        socket.broadcast.emit('user-typing', socket.username);
    });

    socket.on('highlight-text', (highlightData) => {
        socket.broadcast.emit('highlight-text', highlightData);
    });

    // ⭐️ MODIFIED: The server now adds the user's ID and name to the cursor data
    socket.on('mouse-move', (coords) => {
        socket.broadcast.emit('mouse-move', {
            x: coords.x,
            y: coords.y,
            userId: socket.id,
            username: socket.username
        });
    });

    // --- Drawing Handlers ---
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data);
    });

    socket.on('clear-canvas', () => {
        socket.broadcast.emit('clear-canvas');
    });

    // --- Locking Logic Handlers ---
    socket.on('request-lock', (data) => {
        if (!documentLock.locked) {
            documentLock.locked = true;
            documentLock.lockHolder = data.userId;
            io.emit('lock-status', { locked: true, lockHolder: data.userId });
        } else {
            socket.emit('lock-status', { locked: true, lockHolder: documentLock.lockHolder });
        }
    });

    socket.on('release-lock', (data) => {
        if (documentLock.lockHolder === data.userId) {
            documentLock.locked = false;
            documentLock.lockHolder = null;
            io.emit('lock-status', { locked: false, lockHolder: null });
        }
    });
});

// Start the server
httpServer.listen(5000, () => {
    console.log('Server listening on *:5000');
});