const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

if (window.PointerEvent) {
    console.log('Pointer events are supported');
} else {
    console.log('Pointer events are not supported');
}

ctx.imageSmoothingEnabled = false;
ctx.willReadFrequently = true;

// ---------- UI Elements ----------
const 
backgroundPicker = document.getElementById('backgroundPicker');
const colorPicker = document.getElementById('colorPicker');
const colorPicker2 = document.getElementById('colorPicker2');
const colorPicker3 = document.getElementById('colorPicker3');
const colorPicker4 = document.getElementById('colorPicker4');
const brushSizeInput = document.getElementById('brushSize');
const opacityInput = document.getElementById('opacity');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const clearBtn = document.getElementById('clear');
const inviteFriendsBtn = document.getElementById('inviteFriends');
const saveImageBtn = document.getElementById('saveImageBtn');
const imageInput = document.getElementById('imageInput');
const UploadButton = document.getElementById('UploadButton');
const symmetryButton = document.getElementById('symmetry');
const fillModeBtn = document.getElementById('fillModeBtn');

// Create elements to display brush size and opacity values
const brushSizeValue = document.createElement('span');
const opacityValue = document.createElement('span');

// Add the new elements to the DOM
brushSizeInput.parentNode.appendChild(brushSizeValue);

// Optionally add classes for styling
brushSizeValue.classList.add('input-value');

// ---------- Drawing State ----------
let symmetry = true;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let redoHistory = [];
let uploadedImage = null;
let clearedCanvasState = null;
let isFillMode = false;

// ---------- Initialization ----------
ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
ctx.fillRect(0, 0, canvas.width, canvas.height);
brushSizeInput.value = 3;
brushSizeValue.textContent = brushSizeInput.value;

// ---------- Event Listeners ----------
symmetryButton.addEventListener('click', toggleSymmetry);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
clearBtn.addEventListener('click', clearCanvas);


backgroundPicker.addEventListener('input', (event) => {
    canvas.style.backgroundColor = event.target.value;
    redrawCanvas();
});

brushSizeInput.addEventListener('input', () => {
  brushSizeValue.textContent = brushSizeInput.value;
});


// ---------- Functions ----------

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function redrawCanvas() {
    ctx.fillStyle = 
backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (uploadedImage) {
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    }
    history.forEach(imageData => ctx.putImageData(imageData, 0, 0));
}

function clearCanvas() {
    clearedCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 
backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history.push(clearedCanvasState);
    redoHistory = [];
}

function toggleSymmetry() {
    symmetry = !symmetry;
    symmetryButton.classList.toggle('active', symmetry);
}

function undo() {
    if (history.length > 1) {
        redoHistory.push(history.pop());
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (history.length === 0 && clearedCanvasState) {
            ctx.putImageData(clearedCanvasState, 0, 0);
        } else {
            redrawCanvas();
        }
    }
}

function redo() {
    if (redoHistory.length > 0) {
        history.push(redoHistory.pop());
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas();
    }
}

function saveState() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoHistory = [];
}


canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointerout', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}
function draw(e) {
  if (!isDrawing) return;

  e.preventDefault(); // Prevent default touch actions for smoother drawing
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const pressure = e.pressure || 1; // For pen pressure sensitivity

  ctx.lineWidth = brushSizeInput.value * pressure;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  if (symmetry) {
    const centerX = canvas.width / 2;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.beginPath();
    ctx.moveTo(2 * centerX - lastX, lastY);
    ctx.lineTo(2 * centerX - x, y);
    ctx.stroke();
    ctx.restore();
  }

  [lastX, lastY] = [x, y];
}


function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
}

saveImageBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'my-drawing.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// new
canvas.style.cursor = 'url(cursors/pipette.png), auto';
function toggleEyedropper() {
  isEyedropperActive = !isEyedropperActive;
  isBrushEyedropperActive = false;
  canvas.style.cursor = isEyedropperActive ? 'url(cursors/pipette.png), auto' : 'default';
}