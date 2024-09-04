//         // Disable the default context menu for the entire document
//         document.addEventListener('contextmenu', event => event.preventDefault());

//         // Initialize layers and contexts
//         const layers = {};
//         const contexts = {};
//         let currentLayer = 1;
//         let currentCtx;
//         let layerCount = 0;

//         // Initialize other variables
//         let isEyedropperActive = false;
//         let isDrawing = false;
//         let lastX = 0;
//         let lastY = 0;
//         let symmetry = false;

//         // Get DOM elements
//         const brushSizeInput = document.getElementById('brushSize');
//         const opacityInput = document.getElementById('opacity');
//         const pressureBar = document.getElementById('pressureBar');
//         const backgroundPicker = document.getElementById('backgroundPicker');
//         const canvasContainer = document.getElementById('canvasContainer');
//         const layerButtons = document.getElementById('layerButtons');
//         const addLayerBtn = document.getElementById('addLayerBtn');
//         const removeLayerBtn = document.getElementById('removeLayerBtn');

//         // Initialize pressure-supported state
//         const isPressureSupported = 'onpointermove' in window;

//         // History management
//         let history = [];
//         let redoHistory = [];
//         function createLayer() {
//             layerCount++;
//             const canvas = document.createElement('canvas');
//             canvas.id = `layer${layerCount}`;
//             canvas.width = 700;
//             canvas.height = 500;
//             canvas.style.position = 'absolute';
//             canvas.style.top = '0';
//             canvas.style.left = '0';
//             canvas.style.zIndex = layerCount;
//             canvasContainer.appendChild(canvas);

//             layers[layerCount] = canvas;
//             contexts[layerCount] = canvas.getContext('2d');

//             const button = document.createElement('button');
//             button.textContent = layerCount;
//             button.classList.add('layer-button');
//             button.dataset.layer = layerCount;
//             layerButtons.appendChild(button);

//             button.addEventListener('click', function () {
//                 setCurrentLayer(parseInt(this.dataset.layer));
//             });

//             addEventListenersToLayer(canvas);  // Добавляем слушатели событий к новому слою
//             setCurrentLayer(layerCount);
//             initializeLayer(layerCount);
//         }

//         function removeLayer() {
//             if (layerCount > 1) {
//                 const canvas = layers[layerCount];
//                 canvas.remove();
//                 delete layers[layerCount];
//                 delete contexts[layerCount];

//                 const button = layerButtons.lastChild;
//                 button.remove();

//                 layerCount--;
//                 setCurrentLayer(layerCount);
//             }
//         }

//         function setCurrentLayer(layerNum) {
//             currentLayer = layerNum;
//             currentCtx = contexts[currentLayer];
//             document.querySelectorAll('.layer-button').forEach(btn => {
//                 btn.classList.remove('active-layer');
//                 if (parseInt(btn.dataset.layer) === currentLayer) {
//                     btn.classList.add('active-layer');
//                 }
//             });
//             console.log('Switched to layer:', currentLayer, 'Context:', currentCtx);
//         }

//         function initializeLayer(layerNum) {
//             if (layerNum === 1) {
//                 contexts[layerNum].fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
//             } else {
//                 contexts[layerNum].fillStyle = 'rgba(0,0,0,0)'; // Transparent
//             }
//             contexts[layerNum].fillRect(0, 0, layers[layerNum].width, layers[layerNum].height);
//         }

//         function clearCanvas() {
//             if (!currentCtx) return;
//             let clearedCanvasState = currentCtx.getImageData(0, 0, layers[currentLayer].width, layers[currentLayer].height);
//             currentCtx.fillStyle = backgroundPicker.value;
//             currentCtx.fillRect(0, 0, layers[currentLayer].width, layers[currentLayer].height);
//             history.push(clearedCanvasState);
//             redoHistory = [];
//         }

//         function saveState() {
//             if (!currentCtx) {
//                 console.error('Error: currentCtx is undefined in saveState. Current layer:', currentLayer);
//                 return;
//             }
//             history.push(currentCtx.getImageData(0, 0, layers[currentLayer].width, layers[currentLayer].height));
//             redoHistory = [];
//             console.log('State saved for layer:', currentLayer);
//         }

// // function saveState() {
// //   // Store the state of ALL layers
// //   let allLayersState = [];
// //   for (let i = 1; i <= layerCount; i++) {
// //     allLayersState.push(contexts[i].getImageData(0, 0, layers[i].width, layers[i].height));
// //   }
// //   history.push(allLayersState);
// //   redoHistory = []; 
// //   console.log('State saved for all layers');
// // }


//         function startDrawing(e) {
//             if (!currentCtx) {
//                 console.error('Error: currentCtx is undefined in startDrawing. Current layer:', currentLayer);
//                 return;
//             }
//             isDrawing = true;
//             const rect = layers[currentLayer].getBoundingClientRect();
//             [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
//         }

//         function draw(e) {
//             if (!isDrawing || !currentCtx) {
//                 if (!currentCtx) {
//                     console.error('Error: currentCtx is undefined in draw. Current layer:', currentLayer);
//                 }
//                 return;
//             }

//             e.preventDefault();
//             const rect = layers[currentLayer].getBoundingClientRect();
//             const x = e.clientX - rect.left;
//             const y = e.clientY - rect.top;
//             const pressure = e.pressure || 1;

//             currentCtx.lineWidth = brushSizeInput.value * pressure;
//             currentCtx.lineCap = 'round';
//             currentCtx.lineJoin = 'round';
//             currentCtx.globalAlpha = opacityInput.value / 100;

//             currentCtx.beginPath();
//             currentCtx.moveTo(lastX, lastY);
//             currentCtx.lineTo(x, y);
//             currentCtx.stroke();

//             if (symmetry) {
//                 const centerX = layers[currentLayer].width / 2;
//                 const symmetricLastX = centerX + (centerX - lastX);
//                 const symmetricX = centerX + (centerX - x);
//                 currentCtx.beginPath();
//                 currentCtx.moveTo(symmetricLastX, lastY);
//                 currentCtx.lineTo(symmetricX, y);
//                 currentCtx.stroke();
//             }

//             [lastX, lastY] = [x, y];

//             if (isPressureSupported) {
//                 pressureBar.value = pressure * 100;
//             }
//         }

//         function stopDrawing() {
//             if (isDrawing) {
//                 isDrawing = false;
//                 saveState();
//             }
//         }

//         function setDrawingColor(color) {
//             if (currentCtx) {
//                 currentCtx.strokeStyle = color;
//             }
//         }

//         // Event Listeners
//         addLayerBtn.addEventListener('click', createLayer);
//         removeLayerBtn.addEventListener('click', removeLayer);

//         const eyedropperBtn = document.getElementById('eyedropperBtn');
//         eyedropperBtn.addEventListener('click', () => {
//             isEyedropperActive = !isEyedropperActive;
//             if (isEyedropperActive) {
//                 layers[currentLayer].classList.add('pipetteCursor');
//             } else {
//                 layers[currentLayer].classList.remove('pipetteCursor');
//             }
//         });

//         const colorPickers = document.querySelectorAll('input[type="color"]');
//         colorPickers.forEach(picker => {
//             picker.addEventListener('input', (event) => {
//                 setDrawingColor(event.target.value);
//             });
//         });

//         document.addEventListener('touchstart', function (e) {
//             if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
//                 e.preventDefault();
//             }
//         }, { passive: false });

//         function addEventListenersToLayer(layer) {
//             layer.addEventListener('pointerdown', startDrawing);
//             layer.addEventListener('pointermove', draw);
//             layer.addEventListener('pointerup', stopDrawing);
//             layer.addEventListener('pointerout', stopDrawing);
//             layer.addEventListener('pointercancel', stopDrawing);
//         }

//         document.querySelectorAll('button, input').forEach(element => {
//             element.addEventListener('pointerdown', (e) => {
//                 e.stopPropagation();
//             });
//         });

//         function resizeCanvas() {
//             const rect = canvasContainer.getBoundingClientRect();
//             Object.values(layers).forEach(layer => {
//                 layer.width = rect.width * devicePixelRatio;
//                 layer.height = rect.height * devicePixelRatio;
//                 layer.getContext('2d').scale(devicePixelRatio, devicePixelRatio);
//             });
//             Object.keys(layers).forEach(layerNum => initializeLayer(parseInt(layerNum)));
//         }

//         window.addEventListener('resize', resizeCanvas);

//         // Initialize the first layer
//         createLayer();
//         setDrawingColor(document.getElementById('colorPicker').value);
//         resizeCanvas();


//         // Добавляем слушатели событий к существующим слоям
//         Object.values(layers).forEach(addEventListenersToLayer);

//         fillModeBtn.addEventListener('click', toggleFillMode);
//         function toggleFillMode() {
//             isFillMode = !isFillMode;
//             // Optionally add visual indication of fill mode being active or inactive
//             fillModeBtn.classList.toggle('active', isFillMode);
//         }


//         // Flood Fill Functionality
//         function floodFill(e) {
//             const startX = e.offsetX;
//             const startY = e.offsetY;

//             // Use currentCtx and layers[currentLayer]
//             const imageData = currentCtx.getImageData(0, 0, layers[currentLayer].width, layers[currentLayer].height);
//             const data = imageData.data;
//             const width = imageData.width;
//             const height = imageData.height;

//             const targetColor = getPixelColor(data, startX, startY, width);
//             const fillColor = hexToRgba(colorPicker.value);
//             const tolerance = 30;

//             if (colorMatch(targetColor, fillColor, tolerance)) return;

//             const stack = [[startX, startY]];
//             const visited = new Uint8Array(width * height);

//             while (stack.length) {
//                 const [x, y] = stack.pop();
//                 const index = y * width + x;

//                 if (visited[index]) continue;
//                 visited[index] = 1;

//                 const pixelIndex = index * 4;
//                 const currentColor = data.slice(pixelIndex, pixelIndex + 4);

//                 if (colorMatch(currentColor, targetColor, tolerance) || isContourPixel(x, y, data, width, height, targetColor, tolerance)) {
//                     setPixelColor(data, x, y, width, fillColor);

//                     if (x > 0) stack.push([x - 1, y]);
//                     if (x < width - 1) stack.push([x + 1, y]);
//                     if (y > 0) stack.push([x, y - 1]);
//                     if (y < height - 1) stack.push([x, y + 1]);
//                 }
//             }

//             // Оптимизированный дополнительный проход
//             for (let y = 0; y < height; y++) {
//                 for (let x = 0; x < width; x++) {
//                     const index = (y * width + x) * 4;
//                     if (!colorMatch(data.slice(index, index + 4), fillColor, 0) && shouldFillPixel(x, y, data, width, height, fillColor)) {
//                         setPixelColor(data, x, y, width, fillColor);
//                     }
//                 }
//             }

//             // Use currentCtx to putImageData
//             currentCtx.putImageData(imageData, 0, 0);
//             saveState();
//         }


//         layers[currentLayer].addEventListener('click', (e) => {
//             if (isFillMode) {
//                 floodFill(e);
//             }
//         });


//         function getPixelColor(data, x, y, width) {
//             const index = (y * width + x) * 4;
//             return data.slice(index, index + 4);
//         }

//         function setPixelColor(data, x, y, width, color) {
//             const index = (y * width + x) * 4;
//             data.set(color, index);
//         }

//         function isContourPixel(x, y, data, width, height, targetColor, tolerance) {
//             const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
//             const currentColor = getPixelColor(data, x, y, width);

//             if (colorMatch(currentColor, targetColor, tolerance)) return false;

//             return directions.some(([dx, dy]) => {
//                 const nx = x + dx;
//                 const ny = y + dy;
//                 if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
//                     const neighborColor = getPixelColor(data, nx, ny, width);
//                     return colorMatch(neighborColor, targetColor, tolerance);
//                 }
//                 return false;
//             });
//         }

//         function shouldFillPixel(x, y, data, width, height, fillColor) {
//             const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
//             let filledNeighbors = 0;

//             for (const [dx, dy] of directions) {
//                 const nx = x + dx;
//                 const ny = y + dy;
//                 if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
//                     const neighborColor = getPixelColor(data, nx, ny, width);
//                     if (colorMatch(neighborColor, fillColor, 0)) {
//                         filledNeighbors++;
//                     }
//                 }
//             }

//             return filledNeighbors >= 5;
//         }

//         function hexToRgba(hex) {
//             const r = parseInt(hex.slice(1, 3), 16);
//             const g = parseInt(hex.slice(3, 5), 16);
//             const b = parseInt(hex.slice(5, 7), 16);
//             return [r, g, b, 255];
//         }

//         function colorMatch(a, b, tolerance) {
//             return Math.abs(a[0] - b[0]) <= tolerance &&
//                 Math.abs(a[1] - b[1]) <= tolerance &&
//                 Math.abs(a[2] - b[2]) <= tolerance &&
//                 Math.abs(a[3] - b[3]) <= tolerance;
//         }

// function downloadImage() {
//   // Create a temporary canvas to merge all layers
//   const mergeCanvas = document.createElement('canvas');
//   const mergeCtx = mergeCanvas.getContext('2d');
//   mergeCanvas.width = layers[1].width; // Assuming all layers have the same size
//   mergeCanvas.height = layers[1].height;

//   // Draw each layer onto the temporary canvas
//   for (let i = 1; i <= layerCount; i++) {
//     mergeCtx.drawImage(layers[i], 0, 0);
//   }

//   // Create a link and trigger the download
//   const link = document.createElement('a');
//   link.download = 'my-drawing.png';
//   link.href = mergeCanvas.toDataURL('image/png');
//   link.click();
// }

// function undo() {
//   if (history.length > 1) {
//     redoHistory.push(history.pop()); // Save current state to redoHistory
//     let previousState = history[history.length - 1]; 

//     // Clear and redraw ALL layers
//     for (let i = 1; i <= layerCount; i++) {
//       contexts[i].clearRect(0, 0, layers[i].width, layers[i].height);
//       contexts[i].putImageData(previousState[i - 1], 0, 0);
//     }
//   }
// }




// function redo() {
//   if (redoHistory.length > 0) {
//     history.push(redoHistory.pop());
//     currentCtx.clearRect(0, 0, layer1.width, layer1.height);
//     redrawCanvas();
//   }
// }

// function undo() {
//   if (history.length > 1) {
//     redoHistory.push(history.pop());
//     currentCtx.clearRect(0, 0, layer1.width, layer1.height);
//     if (history.length === 0 && clearedCanvasState) {
//       currentCtx.putImageData(clearedCanvasState, 0, 0);
//     } else {
//       redrawCanvas();
//     }
//   }
// }
