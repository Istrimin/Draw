// vkBridge.send('VKWebAppInit');

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
const imageInput = document.getElementById('imageInput'); // Add an input element in your HTML
let uploadedImage = null;

inviteFriendsBtn.addEventListener('click', inviteFriends);

const eraserButton = document.getElementById('eraser');
const symmetryButton = document.getElementById('symmetry');


const customUploadButton = document.getElementById('customUploadButton');
customUploadButton.addEventListener('click', () => {
    imageInput.click(); 
});



// Function to download the canvas content as an image
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'my-drawing.png'; 
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Add event listener to the save button (make sure to get the element by ID)
document.getElementById('saveImageButton').addEventListener('click', downloadImage);


// Function to download the canvas content as an image
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'my-drawing.png'; 
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Add event listener to the save button
saveImageButton.addEventListener('click', downloadImage);




let symmetry = false;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let redoHistory = [];
let isEraser = false;

ctx.imageSmoothingEnabled = false;
ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Image upload handling
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    uploadedImage = new Image();
    uploadedImage.onload = () => {
      // Draw the image on the canvas
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    };
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

backgroundPicker.addEventListener('input', (event) => {
    canvas.style.backgroundColor = event.target.value;
    redrawCanvas();
});

symmetryButton.addEventListener('click', () => {
    symmetry = !symmetry;
    symmetryButton.classList.toggle('active', symmetry);
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function setDrawingCursor() {
    canvas.classList.add('drawingCursor');
    canvas.classList.remove('eraserCursor');
}

function setEraserCursor() {
    canvas.classList.add('eraserCursor');
    canvas.classList.remove('drawingCursor');
}

eraserButton.addEventListener('click', setEraserCursor);
setDrawingCursor(); 

function addToFavorits() {
    vkBridge.send("VKWebAppAddToFavorites", {})
}

function inviteFriends() {
    vkBridge.send("VKWebAppInvite", {})
        .then(data => {
            if (data.success) {
                console.log("Invitation sent successfully!");
            } else {
                console.error("Invitation failed:", data.error);
            }
        })
        .catch(error => {
            console.error("Error sending invitation:", error);
        });
}

function redrawCanvas() {
    ctx.fillStyle = backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the uploaded image first, if it exists
    if (uploadedImage) {
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    }

    history.forEach(imageData => ctx.putImageData(imageData, 0, 0));
}

function startDrawing(e) {
    isDrawing = true;
    lastX = e.offsetX; 
    lastY = e.offsetY;

    // Save the canvas state when starting a new stroke
    saveState(); 
}

function draw(e) {
    if (!isDrawing) return;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? backgroundPicker.value : colorPicker.value;
    ctx.globalAlpha = opacity.value / 100;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    if (symmetry) {
        const centerX = canvas.width / 2;
        const mirroredX = 2 * centerX - e.offsetX;

        ctx.beginPath();
        ctx.moveTo(2 * centerX - lastX, lastY);
        ctx.lineTo(mirroredX, e.offsetY);
        ctx.stroke();
    }

    lastX = e.offsetX;
    lastY = e.offsetY;
}

// Function to draw a single point
function drawPoint(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, brushSize.value / 2, 0, Math.PI * 2); // Use brush size for dot radius
    ctx.fillStyle = isEraser ? backgroundPicker.value : colorPicker.value;
    ctx.globalAlpha = opacity.value / 100;
    ctx.fill();
}

function stopDrawing() {
    isDrawing = false;
}

function undo() {
    if (history.length > 0) {
        redoHistory.push(history.pop());
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas(); // Redraw the canvas with the remaining history
    }
}

function redo() {
    if (redoHistory.length > 0) {
        history.push(redoHistory.pop());
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas(); // Redraw the canvas with the redo history
    }
}

function clearCanvas() {
    ctx.fillStyle = backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    redoHistory = [];
}

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.textContent = isEraser ? 'Brush' : 'Eraser';

    if (isEraser) {
        setEraserCursor();
    } else {
        setDrawingCursor();
    }
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener("click", redo);
clearBtn.addEventListener('click', clearCanvas);

brushSize.value = 1;

function saveState() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoHistory = []; // Clear redo history when a new action is performed
}
