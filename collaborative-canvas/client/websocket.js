import { io } from "socket.io-client";
export const socket = io(window.location.origin);

export function joinRoom(roomId, name) {
  socket.emit("JOIN_ROOM", { roomId, name });
}

export function sendCursor(x,y){
  socket.emit("CURSOR_MOVE",{x,y});
}
