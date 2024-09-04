        document.addEventListener('keydown', function(event) {
            // Use a single switch for better organization
            switch (event.code) {
                case 'KeyA':
                    document.getElementById('eyedropperBtn').click();
                    break;
                case 'KeyZ':
                    undo();
                    break;
                case 'KeyX':
                    redo();
                    break;
                case 'KeyB': // Background color
                    event.preventDefault();
                    document.getElementById('backgroundPicker').click();
                    break;
                case 'KeyE': // Eraser
                    event.preventDefault();
                    document.getElementById('eraser').click();
                    break;
                case 'KeyS': // Save
                    event.preventDefault();
                    document.getElementById('saveImageBtn').click();
                    break;
                case 'KeyR': // Clear
                    event.preventDefault();
                    document.getElementById('clear').click();
                    break;
                case 'KeyQ': // Symmetry
                    event.preventDefault();
                    document.getElementById('symmetry').click();
                    break;
                case 'KeyF': // Fill Mode
                    event.preventDefault();
                    document.getElementById('fillModeBtn').click();
                    break;
                case 'KeyU': // Upload Image
                    event.preventDefault();
                    document.getElementById('UploadButton').click();
                    break;
            }
        });

// кнопки
// ... (Your existing JavaScript code) ...

// Get the undo and redo buttons by their IDs
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');

// Add event listeners for 'click' events
undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);


// пипетка
        document.getElementById('eyedropperBtn').addEventListener('click', toggleEyedropper);
        document.getElementById('brushEyedropperBtn').addEventListener('click', toggleBrushEyedropper);

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.code >= 'Digit1' && event.code <= 'Digit9') {
    const index = parseInt(event.code.replace('Digit', '')) - 1;
    if (index < colorPickers.length) {
      const color = colorPickers[index].value;
      setDrawingColor(color);
    }
  } else if (event.code === 'KeyA') {
    toggleEyedropper();
  } else if (event.code === 'KeyD') {
    toggleBrushEyedropper();
  }
});
