// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const rooms = require("./rooms");
const crypto = require("crypto");
const path = require("path");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, "../client")));

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  let currentRoomId = null;
  let currentRoom = null;
  let userId = crypto.randomUUID();

  // Join a room
  socket.on("JOIN_ROOM", ({ roomId, name }) => {
    currentRoomId = roomId;
    currentRoom = rooms.createRoom(roomId);

    currentRoom.users.set(socket.id, {
      userId,
      name
    });

    socket.join(roomId);

    // Send full state to the newly joined client
    socket.emit("SYNC_STATE", currentRoom.state.getState());

    // Broadcast updated user list to everyone in the room
    io.to(roomId).emit("USER_LIST", [...currentRoom.users.values()]);

    console.log(`${name} joined room ${roomId}`);
  });

  // Receive a new drawing operation
  socket.on("OPERATION", op => {
    if (!currentRoom) return;

    currentRoom.state.addOperation(op);

    // Broadcast to ALL clients (including sender)
    io.to(currentRoomId).emit("OPERATION", op);
  });

  // Global Undo
  socket.on("UNDO", () => {
    if (!currentRoom) return;

    const op = currentRoom.state.undo();
    if (op) {
      console.log("UNDO:", op.id);
      io.to(currentRoomId).emit("UNDO", op);
    }
  });

  // Global Redo
  socket.on("REDO", () => {
    if (!currentRoom) return;

    const op = currentRoom.state.redo();
    if (op) {
      console.log("REDO:", op.id);
      io.to(currentRoomId).emit("REDO", op);
    }
  });

  // Cursor movement broadcasting
  socket.on("CURSOR_MOVE", data => {
    if (!currentRoom) return;

    socket.to(currentRoomId).emit("CURSOR_MOVE", {
      userId,
      ...data
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (!currentRoom) return;

    currentRoom.users.delete(socket.id);
    io.to(currentRoomId).emit(
      "USER_LIST",
      [...currentRoom.users.values()]
    );

    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
