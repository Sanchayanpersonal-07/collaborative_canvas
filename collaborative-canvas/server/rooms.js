const DrawingState = require("./drawing-state");

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: new Map(),
        state: new DrawingState()
      });
    }
    return this.rooms.get(roomId);
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
}

module.exports = new RoomManager();
