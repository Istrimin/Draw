// ! время
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('time').textContent = timeString;
}

const gameStartTime = new Date();

const startTimeHours = gameStartTime.getHours().toString().padStart(2, '0');
const startTimeMinutes = gameStartTime.getMinutes().toString().padStart(2, '0');
const startTimeSeconds = gameStartTime.getSeconds().toString().padStart(2, '0');
document.getElementById('startTime').textContent = `${startTimeHours}:${startTimeMinutes}:${startTimeSeconds}`;

function updateElapsedTime() {
    const currentTime = new Date();
    let elapsedSeconds = Math.floor((currentTime - gameStartTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    elapsedSeconds %= 60;
    document.getElementById('elapsedTime').textContent = `${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')}`;
}

setInterval(updateTime, 1000);

setInterval(updateElapsedTime, 1000);



// ! слово наверху канвас

// ! слово наверху канвас

async function fetchWords() {
    try {
        const response = await fetch('quizz.txt');
        const text = await response.text();
        // Разделяем текст на слова по любым пробелам или запятым
        return text.split(/[\s,]+/).map(word => word.trim());
    } catch (error) {
        console.error('Error loading words:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    // Word navigation
    const wordList = await fetchWords();
    let currentWordIndex = 0;
    const wordElement = document.getElementById("Quizz");
    const previousWordButton = document.getElementById("previousWord");
    const nextWordButton = document.getElementById("nextWord");

    function updateWord() {
        wordElement.textContent = wordList[currentWordIndex];
    }

    previousWordButton.addEventListener("click", () => {
        // Переходим к предыдущему слову, возвращаясь к концу списка при необходимости
        currentWordIndex = (currentWordIndex - 1 + wordList.length) % wordList.length;
        updateWord();
    });

    nextWordButton.addEventListener("click", () => {
        // Переходим к следующему слову, возвращаясь к началу списка при необходимости
        currentWordIndex = (currentWordIndex + 1) % wordList.length;
        updateWord();
    });

    // Отображаем первое слово при загрузке страницы
    updateWord();
});



// !