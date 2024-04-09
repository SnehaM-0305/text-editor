const express = require('express');
const app = express();
const cors = require ('cors');
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://127.0.0.1:5500",   // Your client url
        methods: ["GET", "POST"]
    }
});
users = [] ; 
app.get('/', (req, res)=> {
    res.send("Server is running.");
});

io.on('connection', socket => { 
    const connectedUserId = socket.id;
    users.push(socket.id);
    io.emit('update-user-list', users);
    console.log(`${socket.id} connected`);
   

    socket.on('disconnect', () => {
        let index = users.indexOf(socket.id);
        io.emit('user-disconnected', connectedUserId);
        if (index !== -1) {
          users.splice(index, 1);
        }
        io.emit('update-user-list', users);
       
        
    });

    socket.on('text-edited', (text) => {
        // console.log(text);
        socket.broadcast.emit('receive-changes', text);
    });
    // Handle typing event
socket.on('typing', () => {
   
    const userName = socket.id ; 
   
    socket.broadcast.emit('user-typing', userName); 
});
socket.on('highlight-text', (highlightData) => {
    io.emit('highlight-text', highlightData);
});
//cursor code--------------------------------------------
// Store cursor positions
// Handle mouse movement events from clients
socket.on('mouse-move', (data) => {
    // Broadcast mouse movement data to all connected clients
    io.emit('mouse-move', data);
});




//--------------------------------------------------------


    io.emit('user-connected', connectedUserId);
});


httpServer.listen(5000, () => {
    console.log('listening on *:5000');
});
