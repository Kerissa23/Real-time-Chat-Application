// Connect to the Socket.io server
const socket = io();

// Get references to DOM elements
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');
const usernameInput = document.getElementById('username');
const messagesDiv = document.getElementById('messages');
const typingDiv = document.getElementById('typing');
const userCountDiv = document.getElementById('user-count');

let typing = false;
let timeout = undefined;

// Function to append messages to the chat
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.username}: ${message.message} (${message.timestamp})`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to update the user count
function updateUserCount(count) {
    userCountDiv.textContent = `Connected users: ${count}`;
}

// Listen for form submission (sending a message)
messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Ensure the username and message fields are filled
    if (usernameInput.value && messageInput.value) {
        const message = {
            username: usernameInput.value,
            message: messageInput.value,
        };

        // Send the message to the server
        socket.emit('chat message', message);

        // Clear the message input
        messageInput.value = '';
        typing = false;
        socket.emit('stop typing');
    }
});

// Listen for incoming chat messages from the server
socket.on('chat message', (message) => {
    appendMessage(message);
});

// Display typing indicator
messageInput.addEventListener('input', () => {
    if (!typing) {
        typing = true;
        socket.emit('typing', usernameInput.value);
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        typing = false;
        socket.emit('stop typing');
    }, 1000);
});

// Show typing notification
socket.on('typing', (username) => {
    typingDiv.textContent = `${username} is typing...`;
});

// Clear typing notification
socket.on('stop typing', () => {
    typingDiv.textContent = '';
});

// Update user count
socket.on('user count', (count) => {
    updateUserCount(count);
});
