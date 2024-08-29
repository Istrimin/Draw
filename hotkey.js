document.addEventListener('keydown', function(event) {
  if (event.key === 'a') {
    // Activate the eyedropper tool (assuming your existing code handles this)
    document.getElementById('eyedropperBtn').click(); 

    // Immediately get color under cursor
    const canvas = document.getElementById('drawingCanvas'); 
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pixelData = ctx.getImageData(x, y, 1, 1).data; 
    const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

    // Set the picked color to your color input
    document.getElementById('colorPicker').value = color; 
  }
});
