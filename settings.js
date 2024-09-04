document.addEventListener('DOMContentLoaded', () => {
  // Prevent default dragging for all elements
  document.querySelectorAll('*').forEach(element => {
    element.setAttribute('draggable', 'false'); 
  });

  // Optional: Add visual feedback (cursor change) on drag attempt
  document.addEventListener('dragstart', (event) => {
    event.preventDefault(); // Prevent default drag behavior
    event.dataTransfer.effectAllowed = 'none'; // Indicate dragging is not allowed
    document.body.style.cursor = 'not-allowed'; // Change cursor to "not-allowed"
  });

  // Optional: Reset cursor when dragging stops
  document.addEventListener('dragend', () => {
    document.body.style.cursor = 'auto'; // Reset cursor to default
  });


// !блокировка контекстного меню

        // document.addEventListener('contextmenu', event => event.preventDefault());

        // $(function () {
        //     $("#message-container").resizable();
        // });



});






