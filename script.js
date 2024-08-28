document.addEventListener('DOMContentLoaded', function() {
    // Весь ваш JavaScript-код здесь



// ---------- Canvas and Context ----------
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ---------- UI Elements ----------
const backgroundPicker = document.getElementById('backgroundPicker');
const colorPicker = document.getElementById('colorPicker');
const brushSizeInput = document.getElementById('brushSize'); // Use more descriptive name
const opacityInput = document.getElementById('opacity'); // Use more descriptive name
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const clearBtn = document.getElementById('clear');
const inviteFriendsBtn = document.getElementById('inviteFriends');
const saveImageBtn = document.getElementById('saveImageBtn');
const imageInput = document.getElementById('imageInput');
const customUploadButton = document.getElementById('customUploadButton');
const symmetryButton = document.getElementById('symmetry');
const fillModeBtn = document.getElementById('fillModeBtn'); // Assuming you have a button with this ID

// Create elements to display brush size and opacity values
const brushSizeValue = document.createElement('span');
const opacityValue = document.createElement('span');

// Add the new elements to the DOM
brushSizeInput.parentNode.appendChild(brushSizeValue);
opacityInput.parentNode.appendChild(opacityValue);

// Optionally add classes for styling
brushSizeValue.classList.add('input-value');
opacityValue.classList.add('input-value');

// ---------- Drawing State ----------
let symmetry = true;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let redoHistory = [];
let isEraser = false;
let uploadedImage = null;
let clearedCanvasState = null; // Variable to store the cleared state
let isFillMode = false;

// ---------- Initialization ----------
ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
ctx.fillRect(0, 0, canvas.width, canvas.height);
brushSizeInput.value = 3; // Set initial value for brushSizeInput
brushSizeValue.textContent = brushSizeInput.value; // Update the display for brush size
opacityValue.textContent = opacityInput.value; // Update the display for opacity

// ---------- Event Listeners ----------

// VK API Interactions
inviteFriendsBtn.addEventListener('click', inviteFriends);

// Image Upload
customUploadButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleImageUpload);

// Drawing Tools
symmetryButton.addEventListener('click', toggleSymmetry);
eraserBtn.addEventListener('click', toggleEraser); 
eraserBtn.addEventListener('click', setEraserCursor); // If this is needed, consider renaming for clarity
setDrawingCursor(); // Set initial cursor
fillModeBtn.addEventListener('click', toggleFillMode);
// Canvas Interactions
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Modify the event listener for floodFill
canvas.addEventListener('click', (e) => {
  if (isFillMode) {
    floodFill(e);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyZ') { 
    undo();
  } else if (event.code === 'KeyX') { 
    redo();
  }
});

// Control Buttons
saveImageBtn.addEventListener('click', downloadImage);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
clearBtn.addEventListener('click', clearCanvas);

// Background and Color
backgroundPicker.addEventListener('input', (event) => {
    canvas.style.backgroundColor = event.target.value;
    redrawCanvas();
});

// Update values when input changes
brushSizeInput.addEventListener('input', () => {
  brushSizeValue.textContent = brushSizeInput.value;
});

opacityInput.addEventListener('input', () => {
  opacityValue.textContent = opacityInput.value;
  ctx.globalAlpha = opacityInput.value / 100; 
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

    ctx.lineWidth = brushSizeInput.value; // Use brushSizeInput here
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? backgroundPicker.value : colorPicker.value;
    ctx.globalAlpha = opacityInput.value / 100; // Use opacityInput here

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
    clearedCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history.push(clearedCanvasState); 
    redoHistory = []; 
}

// Tool Functions

// Function to toggle fill mode
function toggleFillMode() {
  isFillMode = !isFillMode;
  // Optionally add visual indication of fill mode being active or inactive
  fillModeBtn.classList.toggle('active', isFillMode); 
}

function toggleSymmetry() {
    symmetry = !symmetry;
    symmetryButton.classList.toggle('active', symmetry);
}

function toggleEraser() {
    isEraser = !isEraser;
    eraserBtn.textContent = isEraser ? '🖌️' : '💩';

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

// Download Image
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'my-drawing.png'; 
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// 
// Flood Fill Functionality
// Flood Fill Functionality
function floodFill(e) {
  const startX = e.offsetX;
  const startY = e.offsetY;
  const targetColor = ctx.getImageData(startX, startY, 1, 1).data;
  const fillColor = hexToRgba(colorPicker.value);
  const tolerance = 30; // Уменьшим толерантность

  if (!colorMatch(targetColor, fillColor, tolerance)) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const stack = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    while (stack.length) {
      const [x, y] = stack.pop();
      const index = y * width + x;

      if (visited[index]) continue;
      visited[index] = 1;

      const pixelIndex = index * 4;
      const currentColor = data.slice(pixelIndex, pixelIndex + 4);

      if (colorMatch(currentColor, targetColor, tolerance) || isContourPixel(x, y, data, width, height, targetColor, tolerance)) {
        // Заливаем текущий пиксель
        data[pixelIndex] = fillColor[0];
        data[pixelIndex + 1] = fillColor[1];
        data[pixelIndex + 2] = fillColor[2];
        data[pixelIndex + 3] = fillColor[3];

        // Проверяем соседние пиксели
        if (x > 0) stack.push([x - 1, y]);
        if (x < width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < height - 1) stack.push([x, y + 1]);
      }
    }

    // Дополнительный проход для заполнения пропущенных пикселей
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const pixelIndex = index * 4;
        if (!colorMatch(data.slice(pixelIndex, pixelIndex + 4), fillColor, 0)) {
          if (shouldFillPixel(x, y, data, width, height, fillColor)) {
            data[pixelIndex] = fillColor[0];
            data[pixelIndex + 1] = fillColor[1];
            data[pixelIndex + 2] = fillColor[2];
            data[pixelIndex + 3] = fillColor[3];
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    saveState();
  }
}

function isContourPixel(x, y, data, width, height, targetColor, tolerance) {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const currentIndex = (y * width + x) * 4;
  const currentColor = data.slice(currentIndex, currentIndex + 4);

  if (colorMatch(currentColor, targetColor, tolerance)) {
    return false;
  }

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const neighborIndex = (ny * width + nx) * 4;
      const neighborColor = data.slice(neighborIndex, neighborIndex + 4);
      if (colorMatch(neighborColor, targetColor, tolerance)) {
        return true;
      }
    }
  }

  return false;
}

function shouldFillPixel(x, y, data, width, height, fillColor) {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  let filledNeighbors = 0;

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const neighborIndex = (ny * width + nx) * 4;
      const neighborColor = data.slice(neighborIndex, neighborIndex + 4);
      if (colorMatch(neighborColor, fillColor, 0)) {
        filledNeighbors++;
      }
    }
  }

  return filledNeighbors >= 5; // Заполняем, если большинство соседей уже заполнены
}


// Helper function to check if a pixel is part of the contour
function isContourPixel(x, y, data, width, height, targetColor, tolerance) {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const currentIndex = (y * width + x) * 4;
  const currentColor = data.slice(currentIndex, currentIndex + 4);

  if (colorMatch(currentColor, targetColor, tolerance)) {
    return false;
  }

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const neighborIndex = (ny * width + nx) * 4;
      const neighborColor = data.slice(neighborIndex, neighborIndex + 4);
      if (colorMatch(neighborColor, targetColor, tolerance)) {
        return true;
      }
    }
  }

  return false;
}

// Helper function to convert hex to RGBA
function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

// Helper function to compare colors with tolerance
function colorMatch(a, b, tolerance) {
  return Math.abs(a[0] - b[0]) <= tolerance &&
         Math.abs(a[1] - b[1]) <= tolerance &&
         Math.abs(a[2] - b[2]) <= tolerance &&
         Math.abs(a[3] - b[3]) <= tolerance;
}



// Initialize cursors after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    window.initCursors();
});

});
