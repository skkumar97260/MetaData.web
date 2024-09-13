const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const router = require('./router/index');
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Socket.io setup
const http = require("http");
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const connectedUsers = [];

io.on('connection', (socket) => {


    socket.on('new-users-add', (newUserId) => {
        // Check if the user is not already added
        if (!connectedUsers.some((user) => user.userId === newUserId)) {
          connectedUsers.push({ userId: newUserId, socketId: socket.id, online: true });
          console.log('New User Connected', connectedUsers);
        }
     
        // Send the updated list of connected users to all clients
        io.emit('get-users', connectedUsers);
        console.log("Users List: ", connectedUsers);
      });
      
      socket.on('sendMessage', (data) => {
        console.log('Received message:', data);
     
        // Broadcast the new message to all clients
        io.emit('newMessage', data);
        console.log('newMessage', data);
      });
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
     
        // Remove the disconnected user from the connectedUsers array
        const disconnectedUserIndex = connectedUsers.findIndex((user) => user.socketId === socket.id);
        if (disconnectedUserIndex !== -1) {
          const disconnectedUserId = connectedUsers[disconnectedUserIndex].userId;
          connectedUsers.splice(disconnectedUserIndex, 1);
          console.log('User disconnected:', disconnectedUserId);
     
          // Send the updated list of connected users to all clients
          io.emit('get-users', connectedUsers);
        }
      });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database Connected Successfully');
  })
  .catch((error) => {
    console.log("Database Connection Failed", error);
  });

app.use('/api', router);

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
