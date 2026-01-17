```md
# 🎨 Real-Time Collaborative Drawing Canvas

A real-time multi-user drawing application built using **HTML5 Canvas**, **Node.js**, and **Socket.IO**.  
This project treats drawing as a **distributed systems problem**, not just a UI problem.  
The canvas is modeled as an **event-sourced replicated state machine**, where every drawing action is an immutable operation and the canvas state is reconstructed by replaying those operations.

This design enables:
- Perfect real-time synchronization
- Deterministic global undo/redo
- Late-join state recovery
- Conflict-free collaboration

---

## 🚀 Features

- 🖌️ Brush and Eraser tools  
- 🎨 Color picker and adjustable stroke width  
- ⚡ Real-time collaborative drawing  
- 👥 Online user list  
- 🟢 Live cursor presence (see where others are drawing)  
- ↩️ Global Undo / Redo (works across all connected users)  
- 🔄 Late-join synchronization (new users see existing drawings)  
- 🧠 Deterministic conflict resolution  
- 📡 WebSocket-based real-time architecture  

---

## 🧠 Design Philosophy

> “The canvas is modeled as a replicated state machine using an operation log.  
> Clients only render state; the server is the single source of truth.”

This means:
- Every stroke is an **operation**
- Undo/Redo modifies operations, not pixels
- The canvas is always recreated by replaying operations
- No bitmap hacks, no pixel rollback

This is an **event-sourced system**, not a normal drawing app.

---

## 🏗️ Architecture Overview

1. User draws → generates an Operation  
2. Operation is sent to server  
3. Server appends it to the operation log  
4. Server broadcasts it to all users  
5. Clients render the operation  
6. Undo/Redo toggles an operation’s `undone` flag  
7. Canvas is redrawn by replaying operations  

---

## 📁 Project Structure

```

collaborative-canvas/
│
├── server/
│   ├── server.js          # Express + Socket.IO server
│   ├── rooms.js           # Room management
│   ├── drawing-state.js   # Operation log + undo/redo engine
│   └── package.json
│
├── client/
│   ├── index.html         # UI layout
│   ├── style.css          # Styling
│   ├── canvas.js          # Canvas rendering engine
│   ├── websocket.js       # WebSocket client
│   └── main.js            # App wiring and logic

````

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```bash
cd server
npm install
````

### 2. Start the server

```bash
node server.js
```

### 3. Open the application

Open in your browser:

```
http://localhost:3000
```

Open the same link in:

* Two different browsers
  or
* Two different tabs

Now you have a real-time collaborative canvas.

---

## 🧪 How to Test Multi-User Collaboration

1. Open the app in two browser windows
2. Draw in one window
3. The second window updates instantly
4. Click **Undo** in any window → all canvases update
5. Click **Redo** → restores globally
6. Watch live cursor movement and online user list

---

## ↩️ Undo / Redo Strategy

Undo and redo are **operation-based**, not pixel-based.

Each drawing action is an operation:

```js
{
  id,
  userId,
  type,
  color,
  width,
  points,
  timestamp,
  undone
}
```

* Undo:

  * Find the latest operation where `undone === false`
  * Set `undone = true`
  * Redraw canvas by replaying all operations

* Redo:

  * Find the latest operation where `undone === true`
  * Set `undone = false`
  * Redraw canvas

This guarantees:

* Determinism
* No visual corruption
* Perfect multi-user consistency

---

## ⚔️ Conflict Resolution

There is no region locking or pixel ownership.

Rule:

> Operations are applied in timestamp order.
> Later operations visually override earlier ones.

If two users draw on the same spot:

* Both strokes exist
* The later one is visible on top
* Undo removes only the selected operation

This is simple, fair, and deterministic.

---

## ⚡ Performance Decisions

* Dual canvas system:

  * `previewCanvas` → live drawing
  * `mainCanvas` → committed strokes
* Point batching for smooth strokes
* Stateless redraw (no bitmap snapshots)
* Eraser implemented using `destination-out` compositing
* Server-authoritative state

---

## 📌 Known Limitations

* No authentication (by design)
* In-memory state only (resets on server restart)
* Single server instance
* No persistent storage
* No database (focus is real-time synchronization)

---
