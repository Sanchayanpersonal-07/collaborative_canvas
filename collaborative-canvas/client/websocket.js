export const socket = io("http://localhost:3000");

export function joinRoom(roomId, name) {
  socket.emit("JOIN_ROOM", { roomId, name });
}

export function sendCursor(x,y){
  socket.emit("CURSOR_MOVE",{x,y});
}
