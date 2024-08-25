// vkBridge.send('VKWebAppInit');

VK.init({
  apiId: 52202085,
  onlyWidgets: true
});


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
const inviteFriendsBtn = document.getElementById('inviteFriends');
const addToFavoritesBtn = document.getElementById('addToFavorites');

inviteFriendsBtn.addEventListener('click', inviteFriends);
addToFavoritesBtn.addEventListener('click', addToFavorites);


let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let redoHistory = [];
let isEraser = false;

ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

backgroundPicker.addEventListener('input', (event) => {
    canvas.style.backgroundColor = event.target.value;
    redrawCanvas();
});


function inviteFriends() {
  VK.callMethod("VKWebAppShowInviteBox", function(data) {
    if (data.success) {
      console.log("Приглашения отправлены успешно!");
    } else {
      console.error("Ошибка при отправке приглашений:", data.error_data);
    }
  });
}


function addToFavorites() {
    vkBridge.send("VKWebAppAddToFavorites", {})
        .then(data => {
            if (data.result) {
                console.log("Added to favorites successfully!");
            } else {
                console.error("Adding to favorites failed.");
            }
        })
        .catch(error => {
            console.error("Error adding to favorites:", error);
        });
}



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
