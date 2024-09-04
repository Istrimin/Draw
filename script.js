// Initialize canvases and contexts


// Eyedropper functionality
// let isBrushEyedropperActive = false;





function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

const clearBtn = document.getElementById('clear');
const saveImageBtn = document.getElementById('saveImageBtn');
const imageInput = document.getElementById('imageInput');
const UploadButton = document.getElementById('UploadButton');
const symmetryButton = document.getElementById('symmetry');
const fillModeBtn = document.getElementById('fillModeBtn');

// Create and append value displays
const brushSizeValue = document.createElement('span');
const opacityValue = document.createElement('span');
brushSizeInput.parentNode.appendChild(brushSizeValue);
opacityInput.parentNode.appendChild(opacityValue);
brushSizeValue.classList.add('input-value');
opacityValue.classList.add('input-value');


let uploadedImage = null;
let clearedCanvasState = null;
let isFillMode = false;

// Check for pressure support
try {
  isPressureSupported = !!window.PointerEvent && 'pressure' in PointerEvent.prototype;
} catch (e) { }


brushSizeInput.value = 3;
brushSizeValue.textContent = brushSizeInput.value;
opacityValue.textContent = opacityInput.value;

// Event listeners
UploadButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleImageUpload);
symmetryButton.addEventListener('click', toggleSymmetry);
saveImageBtn.addEventListener('click', downloadImage);
// undoBtn.addEventListener('click', undo);
// redoBtn.addEventListener('click', redo);
clearBtn.addEventListener('click', clearCanvas);
backgroundPicker.addEventListener('input', (event) => {
  layer1.style.backgroundColor = event.target.value;
  redrawCanvas();
});
brushSizeInput.addEventListener('input', () => {
  brushSizeValue.textContent = brushSizeInput.value;
});
opacityInput.addEventListener('input', () => {
  opacityValue.textContent = opacityInput.value;
  currentCtx.globalAlpha = opacityInput.value / 100;
});

// Layer switching
document.querySelectorAll('.layer-button').forEach(button => {
  button.addEventListener('click', function () {
    // Remove active class from previously active layer
    document.querySelector('.active-layer').classList.remove('active-layer');
    // Add active class to the clicked layer
    this.classList.add('active-layer');

    // Update currentLayer and currentCtx
    currentLayer = parseInt(this.dataset.layer);
    currentCtx = window['ctx' + currentLayer];

    // Ensure no drawing is happening when switching layers
    isDrawing = false;
  });
});

// Functions
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage = new Image();
    uploadedImage.onload = () => {
      currentCtx.drawImage(uploadedImage, 0, 0, layer1.width, layer1.height);
    };
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


function redrawCanvas() {
  currentCtx.fillStyle = backgroundPicker.value;
  currentCtx.fillRect(0, 0, layer1.width, layer1.height);
  if (uploadedImage) {
    currentCtx.drawImage(uploadedImage, 0, 0, layer1.width, layer1.height);
  }
  history.forEach(imageData => currentCtx.putImageData(imageData, 0, 0));
}


function toggleSymmetry() {
  symmetry = !symmetry;
  symmetryButton.classList.toggle('active', symmetry);
}



// Drawing functions


// Eyedropper functions



let isEyedropperActive = false;
let isBrushEyedropperActive = false;

function getPixelColor(x, y) {
  if (!currentCtx) {
    console.error('Error: currentCtx is undefined in getPixelColor. Current layer:', currentLayer);
    return;
  }
  const pixelData = currentCtx.getImageData(x, y, 1, 1).data;
  return `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;
}

function handleEyedropperClick(e) {
  if (isEyedropperActive || isBrushEyedropperActive) {
    const rect = layers[currentLayer].getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pickedColor = getPixelColor(x, y);

    if (isEyedropperActive) {
      document.getElementById('colorPicker').value = pickedColor;
      setDrawingColor(pickedColor); // Update the drawing color
    } else if (isBrushEyedropperActive) {
      document.getElementById('colorPicker3').value = pickedColor; // Assuming you want to set colorPicker3
      setDrawingColor(pickedColor); // Update the drawing color
    }
  }
}

canvasContainer.addEventListener('click', handleEyedropperClick);

function toggleEyedropper() {
  isEyedropperActive = !isEyedropperActive;
  isBrushEyedropperActive = false; // Ensure only one eyedropper is active at a time
  if (isEyedropperActive) {
    canvasContainer.style.cursor = 'url(cursors/pipette.png), auto'; // Assuming you have a pipette cursor image
  } else {
    canvasContainer.style.cursor = 'default';
  }
}

function toggleBrushEyedropper() {
  isBrushEyedropperActive = !isBrushEyedropperActive;
  isEyedropperActive = false; // Ensure only one eyedropper is active at a time
  if (isBrushEyedropperActive) {
    canvasContainer.style.cursor = 'url(cursors/pipette.png), auto'; // Assuming you have a pipette cursor image
  } else {
    canvasContainer.style.cursor = 'default';
  }
}

function toggleEyedropper() {
  isEyedropperActive = !isEyedropperActive;
  document.body.style.cursor = isEyedropperActive ? 'url(cursors/pipette.png), auto' : 'default';
}

function toggleBrushEyedropper() {
  isBrushEyedropperActive = !isBrushEyedropperActive;
  document.body.style.cursor = isBrushEyedropperActive ? 'url(cursors/pipette.png), auto' : 'default';
}


function undo() {
  if (history[currentLayer].length > 1) {
    redoHistory[currentLayer].push(history[currentLayer].pop());
    let previousState = history[currentLayer][history[currentLayer].length - 1];
    contexts[currentLayer].clearRect(0, 0, layers[currentLayer].width, layers[currentLayer].height);
    contexts[currentLayer].putImageData(previousState, 0, 0);
  }
}

function redo() {
  if (redoHistory[currentLayer].length > 0) {
    history[currentLayer].push(redoHistory[currentLayer].pop());
    let nextState = history[currentLayer][history[currentLayer].length - 1];
    contexts[currentLayer].clearRect(0, 0, layers[currentLayer].width, layers[currentLayer].height);
    contexts[currentLayer].putImageData(nextState, 0, 0);
  }
}






function downloadImage() {
  // Create a temporary canvas to merge all layers
  const mergeCanvas = document.createElement('canvas');
  const mergeCtx = mergeCanvas.getContext('2d');
  mergeCanvas.width = layers[1].width; // Assuming all layers have the same size
  mergeCanvas.height = layers[1].height;

  // Draw each layer onto the temporary canvas
  for (let i = 1; i <= layerCount; i++) {
    mergeCtx.drawImage(layers[i], 0, 0);
  }

  // Create a link and trigger the download
  const link = document.createElement('a');
  link.download = 'my-drawing.png';
  link.href = mergeCanvas.toDataURL('image/png');
  link.click();
}


function resizeCanvas() {
  const rect = canvasContainer.getBoundingClientRect();
  Object.values(layers).forEach(layer => {
    layer.width = rect.width * devicePixelRatio;
    layer.height = rect.height * devicePixelRatio;
    layer.getContext('2d').scale(devicePixelRatio, devicePixelRatio);
  });
  Object.keys(layers).forEach(layerNum => initializeLayer(parseInt(layerNum)));
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

// Exit functionality
const exitLink = document.getElementById('exitLink');
const doorSound = new Howl({
  src: ['sounds/door-close.wav']
});

exitLink.addEventListener('click', () => {
  doorSound.play();
  doorSound.once('end', () => {
    window.location.href = 'index.html';
  });
});
