const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

let isDrawing = false;

let currentColor = "#000000";
let brushSize = 3;
let currentTool = "pen";

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();

  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

resizeCanvas();

function getPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

canvas.addEventListener("pointerdown", (event) => {
  isDrawing = true;

  canvas.setPointerCapture(event.pointerId);

  const pos = getPosition(event);

  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("pointermove", (event) => {
  if (!isDrawing) return;

  const pos = getPosition(event);

  ctx.lineWidth = brushSize;

  if (currentTool === "eraser") {
    ctx.strokeStyle = "#ffffff";
  } else {
    ctx.strokeStyle = currentColor;
  }

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
});

function stopDrawing() {
  if (!isDrawing) return;

  isDrawing = false;
  ctx.closePath();
}

canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

window.addEventListener("resize", resizeCanvas);
