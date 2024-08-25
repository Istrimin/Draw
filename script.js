Initialize VK Bridge
vkBridge.send('VKWebAppInit');



// Проверяем, доступен ли VK Bridge
const isVKBridgeAvailable = typeof vkBridge !== 'undefined';

// Инициализируем VK Bridge, если он доступен
if (isVKBridgeAvailable) {
    vkBridge.send('VKWebAppInit')
        .then(data => console.log('VK Bridge initialized:', data))
        .catch(error => console.warn('VK Bridge initialization failed:', error));
} else {
    console.warn('VK Bridge is not available. Running in standalone mode.');
}

// Функция для использования VK-специфичного функционала
function useVKFunctionality(fallbackFunction) {
    if (isVKBridgeAvailable) {
        // Здесь можно использовать vkBridge
        console.log('Using VK Bridge functionality');
        // Пример: vkBridge.send('VKWebAppShowWallPostBox', { message: 'Hello!' });
    } else {
        console.log('VK Bridge unavailable, using fallback');
        if (fallbackFunction) fallbackFunction();
    }
}



const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const backgroundPicker = document.getElementById('backgroundPicker');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const opacity = document.getElementById('opacity');
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const clearBtn = document.getElementById('clear');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let redoHistory = [];
let isEraser = false;

// Initialize canvas with white background
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

backgroundPicker.addEventListener('input', (event) => {
    canvas.style.backgroundColor = event.target.value;
    redrawCanvas();
});

function redrawCanvas() {
    ctx.fillStyle = backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history.forEach(imageData => ctx.putImageData(imageData, 0, 0));
}

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
    ctx.strokeStyle = isEraser ? backgroundPicker.value : colorPicker.value;
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
    redoHistory = [];
}

function undo() {
    if (history.length > 1) {
        redoHistory.push(history.pop());
        ctx.putImageData(history[history.length - 1], 0, 0);
    }
}

function redo() {
    if (redoHistory.length > 0) {
        history.push(redoHistory.pop());
        ctx.putImageData(history[history.length - 1], 0, 0);
    }
}

function clearCanvas() {
    ctx.fillStyle = backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
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
