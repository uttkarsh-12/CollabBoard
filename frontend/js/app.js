const penBtn = document.getElementById("penBtn");
const eraserBtn = document.getElementById("eraserBtn");

const rectBtn = document.getElementById("rectBtn");
const circleBtn = document.getElementById("circleBtn");
const selectBtn = document.getElementById("selectBtn");
const deleteBtn = document.getElementById("deleteBtn");
const lineBtn = document.getElementById("lineBtn");
const arrowBtn = document.getElementById("arrowBtn");

const textBtn = document.getElementById("textBtn");
const stickyBtn = document.getElementById("stickyBtn");

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const resetZoomBtn = document.getElementById("resetZoomBtn");

const colorPicker = document.getElementById("colorPicker");
const brushSizeInput = document.getElementById("brushSize");

const clearBtn = document.getElementById("clearBtn");

// Tool selection
function selectTool(tool, button) {
  currentTool = tool;

  document
    .querySelectorAll(".toolbar button")
    .forEach((btn) => btn.classList.remove("active"));

  button.classList.add("active");
}

// Drawing tools
penBtn.addEventListener("click", () => {
  selectTool("pen", penBtn);
});

eraserBtn.addEventListener("click", () => {
  selectTool("eraser", eraserBtn);
});

rectBtn.addEventListener("click", () => {
  selectTool("rectangle", rectBtn);
});

circleBtn.addEventListener("click", () => {
  selectTool("circle", circleBtn);
});

lineBtn.addEventListener("click", () => {
  selectTool("line", lineBtn);
});

arrowBtn.addEventListener("click", () => {
  selectTool("arrow", arrowBtn);
});

textBtn.addEventListener("click", () => {
  selectTool("text", textBtn);
});

stickyBtn.addEventListener("click", () => {
  selectTool("sticky", stickyBtn);
});

// Color
colorPicker.addEventListener("input", (event) => {
  currentColor = event.target.value;
});

// Brush size
brushSizeInput.addEventListener("input", (event) => {
  brushSize = Number(event.target.value);
});

// Undo and redo
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// Clear
clearBtn.addEventListener("click", clearCanvas);

// Zoom
zoomInBtn.addEventListener("click", zoomIn);
zoomOutBtn.addEventListener("click", zoomOut);
resetZoomBtn.addEventListener("click", resetView);

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  }

  if (event.ctrlKey && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
  }
});
selectBtn.addEventListener("click", () => {
  selectTool("select", selectBtn);
});
deleteBtn.addEventListener("click", () => {
  deleteSelectedElement();
});
// Reset saved board
const resetBoardBtn = document.getElementById("resetBoardBtn");

resetBoardBtn.addEventListener("click", () => {
  const confirmReset = confirm(
    "Are you sure? This will permanently delete your saved board.",
  );

  if (!confirmReset) return;

  // Clear all drawing objects
  elements = [];

  // Reset selection and drawing state
  selectedElement = null;
  currentElement = null;

  // Reset undo/redo history
  history = [[]];
  historyIndex = 0;

  // Remove saved board from browser storage
  localStorage.removeItem("collabboard_elements");

  // Refresh canvas
  renderCanvas();
});
