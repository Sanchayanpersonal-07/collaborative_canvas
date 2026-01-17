class DrawingState {
  constructor() {
    this.operations = [];
  }

  addOperation(op) {
    this.operations.push(op);
  }

  undo() {
    for (let i = this.operations.length - 1; i >= 0; i--) {
      if (!this.operations[i].undone) {
        this.operations[i].undone = true;
        return this.operations[i];
      }
    }
    return null;
  }

  redo() {
    for (let i = this.operations.length - 1; i >= 0; i--) {
      if (this.operations[i].undone) {
        this.operations[i].undone = false;
        return this.operations[i];
      }
    }
    return null;
  }

  getState() {
    return this.operations;
  }
}

module.exports = DrawingState;
