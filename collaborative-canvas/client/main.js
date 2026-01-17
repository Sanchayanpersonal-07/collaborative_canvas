// client/main.js
import { CanvasEngine } from "./canvas.js";
import { socket, joinRoom, sendCursor } from "./websocket.js";

const mainCanvas = document.getElementById("mainCanvas");
const previewCanvas = document.getElementById("previewCanvas");
const engine = new CanvasEngine(mainCanvas, previewCanvas);

// UI elements
const colorInput = document.getElementById("color");
const widthInput = document.getElementById("width");
const brushBtn = document.getElementById("brush");
const eraserBtn = document.getElementById("eraser");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const usersDiv = document.getElementById("users");

// State
let tool = "brush";
let color = colorInput.value || "#000000";
let width = Number(widthInput.value) || 4;
let operations = [];
const cursors = {};

// Join default room
const username = "User-" + Math.floor(Math.random() * 1000);
joinRoom("default", username);

// Helpers
function style() {
  return {
    type: tool === "eraser" ? "erase" : "stroke",
    color,
    width
  };
}

function getMousePos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// Drawing events
previewCanvas.addEventListener("mousedown", e => {
  const { x, y } = getMousePos(previewCanvas, e);
  engine.startStroke(x, y, style());
});

previewCanvas.addEventListener("mousemove", e => {
  const { x, y } = getMousePos(previewCanvas, e);
  engine.updateStroke(x, y, style());
  sendCursor(x, y); // broadcast cursor position
});

window.addEventListener("mouseup", () => {
  const points = engine.endStroke();
  if (!points.length) return;
  if (!socket.connected) return;

  const op = {
    id: crypto.randomUUID(),
    userId: "local",
    ...style(),
    points,
    timestamp: Date.now(),
    undone: false
  };

  socket.emit("OPERATION", op);
});

// Socket listeners
socket.on("OPERATION", op => {
  operations.push(op);
  engine.drawOperation(op);
});

socket.on("UNDO", op => {
  const target = operations.find(o => o.id === op.id);
  if (!target) return;
  target.undone = true;
  engine.redraw(operations);
});

socket.on("REDO", op => {
  const target = operations.find(o => o.id === op.id);
  if (!target) return;
  target.undone = false;
  engine.redraw(operations);
});


socket.on("SYNC_STATE", ops => {
  operations = ops;
  engine.redraw(operations);
});

// Cursor presence
socket.on("CURSOR_MOVE", ({ userId, x, y }) => {
  if (!cursors[userId]) {
    const c = document.createElement("div");
    c.className = "cursor";
    c.style.background = "red";
    document.body.appendChild(c);
    cursors[userId] = c;
  }
  cursors[userId].style.left = x + "px";
  cursors[userId].style.top = y + "px";
});

// User list
socket.on("USER_LIST", users => {
  usersDiv.innerHTML = "<b>Online:</b><br>";
  users.forEach(u => {
    usersDiv.innerHTML += `${u.name}<br>`;
  });
});

// Toolbar events
colorInput.onchange = e => color = e.target.value;
widthInput.oninput = e => width = Number(e.target.value);

brushBtn.onclick = () => tool = "brush";
eraserBtn.onclick = () => tool = "eraser";

undoBtn.onclick = () => {
    if (operations.length === 0) return;
    socket.emit("UNDO");
}

redoBtn.onclick = () => {
    socket.emit("REDO");
}