export class CanvasEngine {
  constructor(mainCanvas, previewCanvas) {
    this.main = mainCanvas;
    this.preview = previewCanvas;
    this.mctx = this.main.getContext("2d");
    this.pctx = this.preview.getContext("2d");

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.isDrawing = false;
    this.currentStroke = [];
  }

  resize() {
  const rect = this.main.parentElement.getBoundingClientRect();
  [this.main, this.preview].forEach(c => {
    c.width = rect.width;
    c.height = rect.height;
  });
}


  startStroke(x, y, style) {
    this.isDrawing = true;
    this.currentStroke = [{ x, y, t: Date.now() }];
    this.drawPoint(this.pctx, x, y, style);
  }

  updateStroke(x, y, style) {
    if (!this.isDrawing) return;
    this.currentStroke.push({ x, y, t: Date.now() });
    this.drawLine(this.pctx, this.currentStroke, style);
  }

  endStroke() {
    this.isDrawing = false;
    this.pctx.clearRect(0, 0, this.preview.width, this.preview.height);
    this.pctx.globalCompositeOperation = "source-over";
    return this.currentStroke;
  }

  drawOperation(op) {
    const ctx = this.mctx;
    
    ctx.lineWidth = op.width;
    ctx.lineCap = "round";

    if (op.type === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = op.color;
    }

    ctx.beginPath();
    op.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  }

  redraw(operations) {
    this.mctx.clearRect(0, 0, this.main.width, this.main.height);
    operations.forEach(op => {
      if (!op.undone) this.drawOperation(op);
    });
  }

  drawPoint(ctx, x, y, style) {
    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.arc(x, y, style.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLine(ctx, points, style) {
    if (points.length < 2) return;

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    ctx.lineWidth = style.width;
    ctx.lineCap = "round";

    if (style.type === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = style.color;
    }
   
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}
