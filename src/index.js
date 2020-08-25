const http = require('http');
const app = require('./app');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');
const { get } = require('./app');
const { use } = require('./routers/public');

const port = process.env.PORT || 3500;
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    // socket.emit('message', generateMessage('Welcome'));
    // socket.broadcast.emit('message', generateMessage('A new user has joined'))

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room)

        // io.to(room).emit - to all users in the room whithout sending info in the other rooms
        // socket.brodcast.to(room).emit - to a specific chat room

        socket.emit('message', generateMessage('Welcome', 'Admin'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const { room, username } = user;
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }
        io.to(room).emit('message', generateMessage(message, username));
        callback('Delivered');
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id);
        const { room, username } = user;
        const { latitude, longitude } = position;
        io.to(room).emit('locationMessage', generateLocationMessage(latitude, longitude, username));
        callback('Location was shared with users')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server started at http://localhost:${3000}`);
})
