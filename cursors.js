// cursors.js

// // Список доступных курсоров
// const cursors = [
//     { name: 'Карандаш', file: 'pencil.png' },
//     // { name: 'Кисть', file: 'brush.png' },
//     { name: 'Ластик', file: 'eraser.png' },
//     // Добавьте другие курсоры по необходимости
// ];

// // Функция для загрузки курсоров
// function loadCursors() {
//     const cursorList = document.getElementById('cursorList');
//     cursorList.innerHTML = '';  // Очищаем список перед добавлением новых элементов
   
//     cursors.forEach(cursor => {
//         const cursorItem = document.createElement('div');
//         cursorItem.className = 'cursor-item';
       
//         const cursorPreview = document.createElement('img');
//         cursorPreview.src = `cursors/${cursor.file}`;
//         cursorPreview.className = 'cursor-preview';
//         cursorPreview.alt = cursor.name;
//         cursorPreview.title = cursor.name;
//         cursorItem.appendChild(cursorPreview);

// // ! применяем курсор
//         cursorItem.addEventListener('click', function() {
//             document.getElementById('drawingCanvas').style.cursor = `url('cursors/${cursor.file}'), auto`;
//             document.getElementById('cursorPanel').style.display = 'none';
//         });
//         cursorList.appendChild(cursorItem);
//     });
// }

// // Функция для инициализации обработчика кнопки смены курсора
// function initChangeCursorButton() {
//     document.getElementById('changeCursorBtn').addEventListener('click', function() {
//         const cursorPanel = document.getElementById('cursorPanel');
//         if (cursorPanel.style.display === 'none') {
//             cursorPanel.style.display = 'block';
//             loadCursors();
//         } else {
//             cursorPanel.style.display = 'none';
//         }
//     });
// }

// // Экспортируем функцию для использования в основном файле
// window.initCursors = initChangeCursorButton;


//     window.initCursors();

