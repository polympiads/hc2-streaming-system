
const express  = require('express');
const http     = require('http');
const socketIO = require('socket.io');

const app = express();

const server = http.createServer(app);
const io     = socketIO(server);

app.use(express.static('public'))

io.on('connection', socket => {
    console.log('New client connected:', socket.id);

    socket.on('offer', data => {
        socket.broadcast.emit('offer', data); // send offer to others
    });

    socket.on('answer', data => {
        socket.broadcast.emit('answer', data); // send answer back
    });

    socket.on('ice-candidate', data => {
        socket.broadcast.emit('ice-candidate', data); // forward ICE candidates
    });
});
  
server.listen(3000, () => {
    console.log('Signaling server running on http://localhost:3000');
});
