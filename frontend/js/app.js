const penBtn = document.getElementById("penBtn");
const eraserBtn = document.getElementById("eraserBtn");

const colorPicker = document.getElementById("colorPicker");
const brushSizeInput = document.getElementById("brushSize");

const clearBtn = document.getElementById("clearBtn");

penBtn.addEventListener("click", () => {
  currentTool = "pen";

  penBtn.classList.add("active");
  eraserBtn.classList.remove("active");
});

eraserBtn.addEventListener("click", () => {
  currentTool = "eraser";

  eraserBtn.classList.add("active");
  penBtn.classList.remove("active");
});

colorPicker.addEventListener("input", (event) => {
  currentColor = event.target.value;
});

brushSizeInput.addEventListener("input", (event) => {
  brushSize = Number(event.target.value);
});

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
