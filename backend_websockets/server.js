const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: "*", // домен
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`Пользователь подключился: ${socket.id}`);

    socket.on('join_board', (boardId) => {
        const roomName = `board_${boardId}`;
        socket.join(roomName);
        console.log(`Юзер ${socket.id} вошел в комнату доски: ${roomName}`);
    });

    socket.on('leave_board', (boardId) => {
        const roomName = `board_${boardId}`;
        socket.leave(roomName);
        console.log(`Юзер ${socket.id} покинул комнату доски: ${roomName}`);
    });

    socket.on('move_task', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('task_moved_broadcast', data);
    });

    socket.on('update_task', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('task_updated_broadcast', data);
    });

    socket.on('create_task', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('task_created_broadcast', data.task);
    });

    socket.on('delete_task', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('task_deleted_broadcast', data.taskId);
    });

    socket.on('update_member_role', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('updated_member_role_broadcast', data.newRole);
    });

    socket.on('remove_board_member', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('remove_board_member_broadcast', data.targetId);
    });

    socket.on('add_board_members', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('add_board_members_broadcast', data.newMembers);
    });

    socket.on('delete_board', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('delete_board_broadcast', data.boardId);
    });

    socket.on('update_board', (data) => {
        const roomName = `board_${data.boardId}`;
        socket.to(roomName).emit('update_board_broadcast', data.boardData);
    });

    socket.on('disconnect', () => {
        console.log(`Пользователь отключился: ${socket.id}`);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`WS-сервер запущен на порту ${PORT}`);
});