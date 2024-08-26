vkBridge.send('VKWebAppInit');

// ---------- Canvas and Context ----------
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ---------- UI Elements ----------
const backgroundPicker = document.getElementById('backgroundPicker');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const opacity = document.getElementById('opacity');
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const clearBtn = document.getElementById('clear');
const inviteFriendsBtn = document.getElementById('inviteFriends');
const saveImageButton = document.getElementById('saveImageButton');
const imageInput = document.getElementById('imageInput');
const customUploadButton = document.getElementById('customUploadButton');
const eraserButton = document.getElementById('eraser'); // Note: This seems to be a duplicate of eraserBtn
const symmetryButton = document.getElementById('symmetry');





// ---------- Drawing State ----------
let symmetry = false;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let redoHistory = [];
let isEraser = false;
let uploadedImage = null;

// ---------- Initialization ----------
ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
ctx.fillRect(0, 0, canvas.width, canvas.height);
brushSize.value = 1; 

// ---------- Event Listeners ----------

// VK API Interactions
inviteFriendsBtn.addEventListener('click', inviteFriends);

// Image Upload
customUploadButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleImageUpload);

// Drawing Tools
symmetryButton.addEventListener('click', toggleSymmetry);
eraserBtn.addEventListener('click', toggleEraser); // Using eraserBtn consistently
eraserButton.addEventListener('click', setEraserCursor); // If this is needed, consider renaming for clarity
setDrawingCursor(); // Set initial cursor

// Canvas Interactions
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('click', floodFill); // Add flood fill on click

// Control Buttons
saveImageButton.addEventListener('click', downloadImage);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
clearBtn.addEventListener('click', clearCanvas);

// Background and Color
backgroundPicker.addEventListener('input', (event) => {
    canvas.style.backgroundColor = event.target.value;
    redrawCanvas();
});

// ---------- Functions ----------

// VK API Functions
function addToFavorits() {
    vkBridge.send("VKWebAppAddToFavorites", {});
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

// Image Handling
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    uploadedImage = new Image();
    uploadedImage.onload = () => {
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    };
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Drawing Functions
function startDrawing(e) {
    isDrawing = true;
    lastX = e.offsetX; 
    lastY = e.offsetY;
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

function stopDrawing() {
    isDrawing = false;
}

// Canvas Manipulation
function redrawCanvas() {
    ctx.fillStyle = backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (uploadedImage) {
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    }

    history.forEach(imageData => ctx.putImageData(imageData, 0, 0));
}

function clearCanvas() {
    ctx.fillStyle = backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    redoHistory = [];
}

// Tool Functions
function toggleSymmetry() {
    symmetry = !symmetry;
    symmetryButton.classList.toggle('active', symmetry);
}

function toggleEraser() {
    isEraser = !isEraser;
    eraserBtn.textContent = isEraser ? 'Brush' : 'Eraser';

    if (isEraser) {
        setEraserCursor();
    } else {
        setDrawingCursor();
    }
}

function setDrawingCursor() {
    canvas.classList.add('drawingCursor');
    canvas.classList.remove('eraserCursor');
}

function setEraserCursor() {
    canvas.classList.add('eraserCursor');
    canvas.classList.remove('drawingCursor');
}

// History Management
function undo() {
    if (history.length > 0) {
        redoHistory.push(history.pop());
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas(); 
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

// Download Image
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'my-drawing.png'; 
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// add resize canvas
function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth; // Or desired width
    canvas.height = canvas.parentElement.offsetHeight; // Or desired height
}

// Call resizeCanvas initially and on window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Flood Fill Functionality
function floodFill(e) {
  const targetColor = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
  const fillColor = hexToRgba(colorPicker.value);

  // Tolerance Level (adjust as needed)
  const tolerance = 10; // Allow a difference of 10 in RGB values

  if (!colorMatch(targetColor, fillColor, tolerance)) { // Pass tolerance to colorMatch
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const stack = [[e.offsetX, e.offsetY]];

    while (stack.length) {
      const [x, y] = stack.pop();
      const index = (y * width + x) * 4;

      if (index < 0 || index > data.length - 4 || 
          !colorMatch(data.slice(index, index + 4), targetColor, tolerance)) { // Check with tolerance
        continue;
      }

      data[index] = fillColor[0];
      data[index + 1] = fillColor[1];
      data[index + 2] = fillColor[2];
      data[index + 3] = fillColor[3];

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveState();
  }
}

// Helper Functions for Flood Fill
function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255]; // Assuming full opacity
}

function colorMatch(a, b, tolerance) {
  return Math.abs(a[0] - b[0]) <= tolerance &&
         Math.abs(a[1] - b[1]) <= tolerance &&
         Math.abs(a[2] - b[2]) <= tolerance &&
         Math.abs(a[3] - b[3]) <= tolerance;
}
