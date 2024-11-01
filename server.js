// Import necessary libraries
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const moment = require('moment');

// Initialize the Express app and the HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);  // Initialize Socket.io with the server

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// Track the number of connected users
let connectedUsers = 0;

// Handle new client connections via Socket.io
io.on('connection', (socket) => {
    // Increment and log the user count
    connectedUsers++;
    console.log(`New user connected, Socket ID: ${socket.id}, Connected Users: ${connectedUsers}`);

    // Notify all clients of the updated user count
    io.emit('user count', connectedUsers);

    // Listen for chat messages from the client
    socket.on('chat message', (data) => {
        const timestamp = moment().format('h:mm A');  // Generate the current timestamp

        // Broadcast the message to all connected clients
        io.emit('chat message', { ...data, timestamp });
        console.log(`Message from ${data.username}: ${data.message} [${timestamp}]`);
    });

    // Handle typing notifications
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);  // Broadcast to all other clients
        console.log(`${username} is typing...`);
    });

    // Handle stop typing event (optional)
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');  // Notify others that typing has stopped
    });

    // Handle client disconnect event
    socket.on('disconnect', () => {
        connectedUsers--;
        console.log(`User disconnected, Socket ID: ${socket.id}, Connected Users: ${connectedUsers}`);

        // Notify all clients of the updated user count
        io.emit('user count', connectedUsers);
    });
});

// Define the port to listen on
const PORT = process.env.PORT || 4000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server encountered an error:', error);
});
