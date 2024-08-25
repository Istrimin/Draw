// Initialize VK Bridge
vkBridge.send('VKWebAppInit');

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const opacity = document.getElementById('opacity');
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const clearBtn = document.getElementById('clear');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
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
}

function undo() {
    if (history.length > 0) {
        ctx.putImageData(history.pop(), 0, 0);
    }
}

function clearCanvas() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history = [];
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
clearBtn.addEventListener('click', clearCanvas);
