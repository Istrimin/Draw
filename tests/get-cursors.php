<?php
// Путь к папке с курсорами
$cursorDir = 'cursors/';

// Получение списка файлов в папке
$cursorFiles = scandir($cursorDir);

// Фильтрация списка, чтобы исключить "." и ".."
$cursorFiles = array_diff($cursorFiles, array('.', '..'));

// Формирование массива с информацией о курсорах
$cursors = [];
foreach ($cursorFiles as $filename) {
  $cursors[] = [
    'name' => pathinfo($filename, PATHINFO_FILENAME), // Имя курсора без расширения
    'image' => $cursorDir . $filename // Путь к изображению курсора
  ];
}

// Отправка ответа в формате JSON
header('Content-Type: application/json');
echo json_encode($cursors);
?>
