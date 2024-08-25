// Initialize VK Bridge
vkBridge.send('VKWebAppInit');

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const opacity = document.getElementById('opacity');
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const saveBtn = document.getElementById('save');

const clearBtn = document.getElementById('clear');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let redoHistory = []; // Store undone actions
let isEraser = false;

// Set canvas background to dark color
ctx.fillStyle = '#333';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    saveState();
}

function draw(e) {
    if (!isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = isEraser ? '#333' : colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.globalAlpha = opacity.value / 100;
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

function saveState() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoHistory = []; // Clear redo history when a new action is performed
}

function undo() {
    if (history.length > 0) {
        redoHistory.push(history.pop()); // Move the undone action to redoHistory
        ctx.putImageData(history[history.length - 1], 0, 0);
    }
}

function redo() {
    if (redoHistory.length > 0) {
        history.push(redoHistory.pop()); // Get the last undone action
        ctx.putImageData(history[history.length - 1], 0, 0);
    }
}

function clearCanvas() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history = [];
    redoHistory = [];
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.textContent = isEraser ? 'Brush' : 'Eraser';
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener("click", redo);
clearBtn.addEventListener('click', clearCanvas);
