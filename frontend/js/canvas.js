// ==========================================
// LOCAL STORAGE
// ==========================================

const STORAGE_KEY = "collabboard_elements";

// Save drawings
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));

    console.log("Whiteboard auto-saved!");
  } catch (error) {
    console.error("Unable to save whiteboard:", error);
  }
}

// Load drawings
function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) return;

    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) return;

    elements = parsedData;

    console.log("Whiteboard restored!");
  } catch (error) {
    console.error("Unable to load whiteboard:", error);

    elements = [];
  }
}
const canvas = document.getElementById("whiteboard");
if (!canvas) {
  throw new Error('Canvas element with id "whiteboard" was not found.');
}

const ctx = canvas.getContext("2d");

// ==========================================
// 1. DRAWING STATE
// ==========================================

let isDrawing = false;
let currentTool = "pen";
let currentColor = "#000000";
let brushSize = 3;

let elements = [];
let currentElement = null;

// ==========================================
// 2. SELECTION, MOVEMENT AND RESIZING STATE
// ==========================================

let selectedElement = null;

let isMoving = false;
let moveStart = null;
let hasMoved = false;

let isResizing = false;
let activeHandle = null;
let originalElement = null;

// ==========================================
// 3. HISTORY
// ==========================================

let history = [[]];
let historyIndex = 0;

function cloneElements(source) {
  return JSON.parse(JSON.stringify(source));
}

function saveHistory() {
  history = history.slice(0, historyIndex + 1);

  history.push(JSON.parse(JSON.stringify(elements)));

  historyIndex++;

  // Automatically persist completed changes
  saveToLocalStorage();
}

function undo() {
  if (historyIndex <= 0) return;

  historyIndex--;
  elements = cloneElements(history[historyIndex]);
  selectedElement = null;
  renderCanvas();
}

function redo() {
  if (historyIndex >= history.length - 1) return;

  historyIndex++;
  elements = cloneElements(history[historyIndex]);
  selectedElement = null;
  renderCanvas();
}

// ==========================================
// 4. VIEW STATE
// ==========================================

let scale = 1;
let panX = 0;
let panY = 0;

let isPanning = false;
let spacePressed = false;
let lastPointer = null;

// ==========================================
// 5. CANVAS INITIALIZATION
// ==========================================

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Keep the canvas backing store sharp on high-DPI displays.
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));

  renderCanvas();
}

// ==========================================
// 6. COORDINATE CONVERSION
// ==========================================

function getPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  return {
    x: (screenX - panX) / scale,
    y: (screenY - panY) / scale,
  };
}

// ==========================================
// 7. TEXT WRAPPING
// ==========================================

function drawWrappedText(text, x, y, maxWidth, lineHeight) {
  const paragraphs = String(text ?? "").split("\n");
  let currentY = y;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    let line = "";

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;

      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY - y;
}

// ==========================================
// 8. DRAW ONE ELEMENT
// ==========================================

function drawElement(element) {
  ctx.save();

  ctx.lineWidth = element.lineWidth || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ERASER
  if (element.type === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    const points = element.points || [];

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      if (points.length === 1) {
        ctx.lineTo(points[0].x + 0.01, points[0].y);
      }

      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  ctx.strokeStyle = element.color || "#000000";
  ctx.fillStyle = element.color || "#000000";

  // PEN
  if (element.type === "pen") {
    const points = element.points || [];

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      if (points.length === 1) {
        ctx.lineTo(points[0].x + 0.01, points[0].y);
      }

      ctx.stroke();
    }
  }

  // RECTANGLE
  else if (element.type === "rectangle") {
    const x = Math.min(element.startX, element.endX);
    const y = Math.min(element.startY, element.endY);
    const width = Math.abs(element.endX - element.startX);
    const height = Math.abs(element.endY - element.startY);
    ctx.strokeRect(x, y, width, height);
  }

  // CIRCLE / ELLIPSE
  else if (element.type === "circle") {
    const centerX = (element.startX + element.endX) / 2;
    const centerY = (element.startY + element.endY) / 2;
    const radiusX = Math.abs(element.endX - element.startX) / 2;
    const radiusY = Math.abs(element.endY - element.startY) / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // LINE
  else if (element.type === "line") {
    ctx.beginPath();
    ctx.moveTo(element.startX, element.startY);
    ctx.lineTo(element.endX, element.endY);
    ctx.stroke();
  }

  // ARROW
  else if (element.type === "arrow") {
    const angle = Math.atan2(
      element.endY - element.startY,
      element.endX - element.startX,
    );
    const headLength = Math.max(12, (element.lineWidth || 2) * 4);

    ctx.beginPath();
    ctx.moveTo(element.startX, element.startY);
    ctx.lineTo(element.endX, element.endY);

    ctx.moveTo(element.endX, element.endY);
    ctx.lineTo(
      element.endX - headLength * Math.cos(angle - Math.PI / 6),
      element.endY - headLength * Math.sin(angle - Math.PI / 6),
    );

    ctx.moveTo(element.endX, element.endY);
    ctx.lineTo(
      element.endX - headLength * Math.cos(angle + Math.PI / 6),
      element.endY - headLength * Math.sin(angle + Math.PI / 6),
    );

    ctx.stroke();
  }

  // TEXT
  else if (element.type === "text") {
    const fontSize = element.fontSize || 24;
    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = "top";
    drawWrappedText(
      element.text,
      element.x,
      element.y,
      element.maxWidth || 300,
      fontSize * 1.4,
    );
  }

  // STICKY NOTE
  else if (element.type === "sticky") {
    const width = element.width || 180;
    const height = element.height || 150;

    ctx.fillStyle = element.background || "#FFF176";
    ctx.fillRect(element.x, element.y, width, height);

    ctx.fillStyle = "#222222";
    ctx.font = `${element.fontSize || 16}px Arial`;
    ctx.textBaseline = "top";
    drawWrappedText(
      element.text,
      element.x + 12,
      element.y + 12,
      width - 24,
      (element.fontSize || 16) * 1.3,
    );
  }

  ctx.restore();
}

// ==========================================
// 9. GET ELEMENT BOUNDARIES
// ==========================================

function getElementBounds(element) {
  if (!element) return null;

  // SHAPES, LINE AND ARROW
  if (["rectangle", "circle", "line", "arrow"].includes(element.type)) {
    const minX = Math.min(element.startX, element.endX);
    const minY = Math.min(element.startY, element.endY);

    return {
      x: minX,
      y: minY,
      width: Math.max(1, Math.abs(element.endX - element.startX)),
      height: Math.max(1, Math.abs(element.endY - element.startY)),
    };
  }

  // PEN AND ERASER
  if (element.type === "pen" || element.type === "eraser") {
    const points = element.points || [];
    if (points.length === 0) return null;

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }

  // TEXT
  if (element.type === "text") {
    ctx.save();
    const fontSize = element.fontSize || 24;
    ctx.font = `${fontSize}px Arial`;

    const lines = String(element.text || "").split("\n");
    const width = Math.max(
      1,
      ...lines.map((line) => ctx.measureText(line).width),
    );
    const height = Math.max(fontSize * 1.4, lines.length * fontSize * 1.4);
    ctx.restore();

    return {
      x: element.x,
      y: element.y,
      width: Math.min(element.maxWidth || 300, width),
      height,
    };
  }

  // STICKY NOTE
  if (element.type === "sticky") {
    return {
      x: element.x,
      y: element.y,
      width: element.width || 180,
      height: element.height || 150,
    };
  }

  return null;
}

// ==========================================
// 10. DRAW SELECTION BOUNDARY AND HANDLES
// ==========================================

function drawSelection(element) {
  const bounds = getElementBounds(element);
  if (!bounds) return;

  ctx.save();
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 1.5 / scale;
  ctx.setLineDash([5 / scale, 4 / scale]);

  const padding = 5;
  ctx.strokeRect(
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2,
  );

  ctx.setLineDash([]);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#2563eb";

  const handleSize = 8 / scale;
  const corners = getHandlePositions(bounds);

  corners.forEach(({ x, y }) => {
    ctx.fillRect(
      x - handleSize / 2,
      y - handleSize / 2,
      handleSize,
      handleSize,
    );
    ctx.strokeRect(
      x - handleSize / 2,
      y - handleSize / 2,
      handleSize,
      handleSize,
    );
  });

  ctx.restore();
}

function getHandlePositions(bounds) {
  const padding = 5;

  return [
    { name: "nw", x: bounds.x - padding, y: bounds.y - padding },
    { name: "ne", x: bounds.x + bounds.width + padding, y: bounds.y - padding },
    {
      name: "sw",
      x: bounds.x - padding,
      y: bounds.y + bounds.height + padding,
    },
    {
      name: "se",
      x: bounds.x + bounds.width + padding,
      y: bounds.y + bounds.height + padding,
    },
  ];
}

function getResizeHandleAt(pos, element) {
  const bounds = getElementBounds(element);
  if (!bounds) return null;

  const tolerance = 10 / scale;
  const handles = getHandlePositions(bounds);

  for (const handle of handles) {
    const distance = Math.hypot(pos.x - handle.x, pos.y - handle.y);
    if (distance <= tolerance) return handle.name;
  }

  return null;
}

// ==========================================
// 11. RENDER ENTIRE CANVAS
// ==========================================

function renderCanvas() {
  const dpr = window.devicePixelRatio || 1;

  // Clear in physical pixels.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply device-pixel ratio, zoom and pan.
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * panX, dpr * panY);

  elements.forEach(drawElement);

  if (currentElement) {
    drawElement(currentElement);
  }

  if (selectedElement) {
    drawSelection(selectedElement);
  }
}

// ==========================================
// 12. FIND ELEMENT AT POSITION
// ==========================================

function findElementAt(pos) {
  // Search from the topmost object to the bottommost object.
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    const bounds = getElementBounds(element);
    if (!bounds) continue;

    const padding = Math.max(8 / scale, (element.lineWidth || 2) / 2);

    if (
      pos.x >= bounds.x - padding &&
      pos.x <= bounds.x + bounds.width + padding &&
      pos.y >= bounds.y - padding &&
      pos.y <= bounds.y + bounds.height + padding
    ) {
      return element;
    }
  }

  return null;
}

// ==========================================
// 13. MOVE ELEMENT
// ==========================================

function moveElement(element, dx, dy) {
  if (element.type === "pen" || element.type === "eraser") {
    element.points.forEach((point) => {
      point.x += dx;
      point.y += dy;
    });
  } else if (["rectangle", "circle", "line", "arrow"].includes(element.type)) {
    element.startX += dx;
    element.startY += dy;
    element.endX += dx;
    element.endY += dy;
  } else if (element.type === "text" || element.type === "sticky") {
    element.x += dx;
    element.y += dy;
  }
}

// ==========================================
// 14. RESIZE ELEMENT
// ==========================================

function resizeElement(element, original, handle, pos) {
  if (!element || !original || !handle) return;

  const bounds = getElementBounds(original);
  if (!bounds) return;

  // The opposite corner remains fixed.
  const anchorX = handle.includes("w") ? bounds.x + bounds.width : bounds.x;
  const anchorY = handle.includes("n") ? bounds.y + bounds.height : bounds.y;

  const newLeft = Math.min(pos.x, anchorX);
  const newTop = Math.min(pos.y, anchorY);
  const newWidth = Math.max(1, Math.abs(anchorX - pos.x));
  const newHeight = Math.max(1, Math.abs(anchorY - pos.y));

  function mapX(x) {
    const ratio = bounds.width > 0 ? (x - bounds.x) / bounds.width : 0;
    return newLeft + ratio * newWidth;
  }

  function mapY(y) {
    const ratio = bounds.height > 0 ? (y - bounds.y) / bounds.height : 0;
    return newTop + ratio * newHeight;
  }

  // Resize freehand strokes by transforming each point.
  if (element.type === "pen" || element.type === "eraser") {
    element.points = original.points.map((point) => ({
      x: mapX(point.x),
      y: mapY(point.y),
    }));
  }
  // Resize shapes, lines and arrows by transforming both endpoints.
  else if (["rectangle", "circle", "line", "arrow"].includes(element.type)) {
    element.startX = mapX(original.startX);
    element.startY = mapY(original.startY);
    element.endX = mapX(original.endX);
    element.endY = mapY(original.endY);
  }
  // Text and sticky notes are not resizable in this version.
}

// ==========================================
// 15. DELETE SELECTED ELEMENT
// ==========================================

function deleteSelectedElement() {
  if (!selectedElement) return;

  elements = elements.filter((element) => element.id !== selectedElement.id);
  selectedElement = null;
  saveHistory();
  renderCanvas();
}

// ==========================================
// 16. CLEAR CANVAS
// ==========================================

function clearCanvas() {
  if (elements.length === 0) return;

  elements = [];
  currentElement = null;
  selectedElement = null;
  isDrawing = false;
  isMoving = false;
  isResizing = false;
  originalElement = null;
  activeHandle = null;

  saveHistory();
  renderCanvas();
}

// ==========================================
// 17. START POINTER ACTION
// ==========================================

canvas.addEventListener("pointerdown", (event) => {
  // Middle mouse button or Space + left mouse button pans the board.
  if (event.button === 1 || (spacePressed && event.button === 0)) {
    isPanning = true;
    lastPointer = {
      x: event.clientX,
      y: event.clientY,
    };
    canvas.classList.add("panning");
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  if (event.button !== 0) return;

  const pos = getPosition(event);

  // SELECT TOOL
  if (currentTool === "select") {
    // Check handles on the currently selected element first.
    if (selectedElement) {
      activeHandle = getResizeHandleAt(pos, selectedElement);
    }

    if (activeHandle && selectedElement) {
      // Only supported element types can be resized currently.
      const resizableTypes = [
        "rectangle",
        "circle",
        "line",
        "arrow",
        "pen",
        "eraser",
      ];

      if (resizableTypes.includes(selectedElement.type)) {
        isResizing = true;
        originalElement = cloneElements([selectedElement])[0];
        canvas.setPointerCapture(event.pointerId);
      } else {
        activeHandle = null;
      }
    }

    if (!isResizing) {
      selectedElement = findElementAt(pos);
      activeHandle = null;

      if (selectedElement) {
        isMoving = true;
        hasMoved = false;
        moveStart = pos;
        canvas.setPointerCapture(event.pointerId);
      }
    }

    renderCanvas();
    return;
  }

  // TEXT TOOL
  if (currentTool === "text") {
    const text = prompt("Enter your text:");
    if (text === null || !text.trim()) return;

    elements.push({
      id: crypto.randomUUID(),
      type: "text",
      x: pos.x,
      y: pos.y,
      text,
      fontSize: 24,
      maxWidth: 300,
      color: currentColor,
    });

    selectedElement = null;
    saveHistory();
    renderCanvas();
    return;
  }

  // STICKY NOTE TOOL
  if (currentTool === "sticky") {
    const text = prompt("Enter sticky note content:");
    if (text === null || !text.trim()) return;

    elements.push({
      id: crypto.randomUUID(),
      type: "sticky",
      x: pos.x,
      y: pos.y,
      text,
      width: 180,
      height: 150,
      fontSize: 16,
      background: "#FFF176",
    });

    selectedElement = null;
    saveHistory();
    renderCanvas();
    return;
  }

  // START DRAWING
  selectedElement = null;
  isDrawing = true;
  canvas.setPointerCapture(event.pointerId);

  if (currentTool === "pen" || currentTool === "eraser") {
    currentElement = {
      id: crypto.randomUUID(),
      type: currentTool,
      points: [pos],
      color: currentColor,
      lineWidth: brushSize,
    };
  } else {
    currentElement = {
      id: crypto.randomUUID(),
      type: currentTool,
      startX: pos.x,
      startY: pos.y,
      endX: pos.x,
      endY: pos.y,
      color: currentColor,
      lineWidth: brushSize,
    };
  }
});

// ==========================================
// 18. POINTER MOVE
// ==========================================

canvas.addEventListener("pointermove", (event) => {
  // PAN CANVAS
  if (isPanning) {
    panX += event.clientX - lastPointer.x;
    panY += event.clientY - lastPointer.y;

    lastPointer = {
      x: event.clientX,
      y: event.clientY,
    };

    renderCanvas();
    return;
  }

  // RESIZE SELECTED ELEMENT
  if (isResizing && selectedElement && originalElement) {
    const pos = getPosition(event);

    resizeElement(selectedElement, originalElement, activeHandle, pos);

    renderCanvas();
    return;
  }

  // MOVE SELECTED ELEMENT
  if (isMoving && selectedElement) {
    const pos = getPosition(event);
    const dx = pos.x - moveStart.x;
    const dy = pos.y - moveStart.y;

    if (dx !== 0 || dy !== 0) {
      moveElement(selectedElement, dx, dy);
      hasMoved = true;
    }

    moveStart = pos;
    renderCanvas();
    return;
  }

  // DRAWING
  if (!isDrawing || !currentElement) return;

  const pos = getPosition(event);

  if (currentElement.type === "pen" || currentElement.type === "eraser") {
    currentElement.points.push(pos);
  } else {
    currentElement.endX = pos.x;
    currentElement.endY = pos.y;
  }

  renderCanvas();
});

// ==========================================
// 19. STOP POINTER ACTION
// ==========================================

function stopPointerAction() {
  // STOP PANNING
  if (isPanning) {
    isPanning = false;
    lastPointer = null;
    canvas.classList.remove("panning");
    return;
  }

  // FINISH RESIZING
  if (isResizing) {
    isResizing = false;

    if (selectedElement && originalElement) {
      saveHistory();
    }

    originalElement = null;
    activeHandle = null;
    renderCanvas();
    return;
  }

  // FINISH MOVEMENT
  if (isMoving) {
    isMoving = false;
    moveStart = null;

    if (hasMoved) {
      saveHistory();
    }

    hasMoved = false;
    renderCanvas();
    return;
  }

  // FINISH DRAWING
  if (!isDrawing) return;

  isDrawing = false;

  if (currentElement) {
    elements.push(currentElement);
    currentElement = null;
    saveHistory();
    renderCanvas();
  }
}

canvas.addEventListener("pointerup", stopPointerAction);
canvas.addEventListener("pointercancel", stopPointerAction);

// ==========================================
// 20. KEYBOARD PAN AND SHORTCUTS
// ==========================================

window.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  const isTyping = ["INPUT", "TEXTAREA"].includes(tag);

  if (event.code === "Space" && !isTyping) {
    event.preventDefault();
    spacePressed = true;
  }

  if (isTyping) return;

  if (event.ctrlKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  }

  if (event.ctrlKey && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
  }

  if (event.key === "Delete" || event.key === "Backspace") {
    deleteSelectedElement();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spacePressed = false;
  }
});

window.addEventListener("blur", () => {
  spacePressed = false;

  // Avoid leaving the pointer interaction stuck if the window loses focus.
  if (isPanning) {
    isPanning = false;
    lastPointer = null;
    canvas.classList.remove("panning");
  }
});

// ==========================================
// 21. ZOOM
// ==========================================

function zoomAt(factor, screenX, screenY) {
  const oldScale = scale;
  const newScale = Math.max(0.25, Math.min(3, oldScale * factor));

  if (newScale === oldScale) return;

  // Keep the world point under the cursor stationary while zooming.
  const worldX = (screenX - panX) / oldScale;
  const worldY = (screenY - panY) / oldScale;

  scale = newScale;
  panX = screenX - worldX * scale;
  panY = screenY - worldY * scale;

  updateZoomLabel();
  renderCanvas();
}

function zoomIn() {
  const rect = canvas.getBoundingClientRect();
  zoomAt(1.2, rect.width / 2, rect.height / 2);
}

function zoomOut() {
  const rect = canvas.getBoundingClientRect();
  zoomAt(1 / 1.2, rect.width / 2, rect.height / 2);
}

function resetView() {
  scale = 1;
  panX = 0;
  panY = 0;
  updateZoomLabel();
  renderCanvas();
}

// ==========================================
// 22. MOUSE WHEEL ZOOM
// ==========================================

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    zoomAt(event.deltaY < 0 ? 1.1 : 1 / 1.1, screenX, screenY);
  },
  { passive: false },
);

// ==========================================
// 23. UPDATE ZOOM LABEL
// ==========================================

function updateZoomLabel() {
  const label = document.getElementById("zoomLevel");
  if (label) {
    label.textContent = `${Math.round(scale * 100)}%`;
  }
}

// ==========================================
// 24. EDIT TEXT AND STICKY NOTES
// ==========================================

canvas.addEventListener("dblclick", (event) => {
  const pos = getPosition(event);
  const element = findElementAt(pos);

  if (!element) return;
  if (element.type !== "text" && element.type !== "sticky") return;

  const updatedText = prompt("Edit content:", element.text);
  if (updatedText === null || !updatedText.trim()) return;

  element.text = updatedText;
  selectedElement = element;
  saveHistory();
  renderCanvas();
});

// ==========================================
// 25. WINDOW RESIZE AND INITIAL RENDER
// ==========================================

window.addEventListener("resize", resizeCanvas);
loadFromLocalStorage();

history = [JSON.parse(JSON.stringify(elements))];

historyIndex = 0;

resizeCanvas();
updateZoomLabel();
