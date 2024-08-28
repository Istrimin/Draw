
        // Пипетка
        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');
        const colorPicker = document.getElementById('colorPicker');
        const eyedropperBtn = document.getElementById('eyedropperBtn');

        let isEyedropperActive = false;

        eyedropperBtn.addEventListener('click', () => {
            isEyedropperActive = !isEyedropperActive;
            document.body.style.cursor = isEyedropperActive ? 'crosshair' : 'default';

            // Toggle the "active" class on the button
            eyedropperBtn.classList.toggle('active'); 
        });

        canvas.addEventListener('click', (e) => {
            if (isEyedropperActive) {
                const x = e.offsetX;
                const y = e.offsetY;
                const pixelData = ctx.getImageData(x, y, 1, 1).data;
                const hexColor = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
                colorPicker.value = hexColor;

                // Деактивируем пипетку и убираем подсветку кнопки
                isEyedropperActive = false; 
                document.body.style.cursor = 'default';
                eyedropperBtn.classList.remove('active'); // Убираем класс 'active'
            }
        });

        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }