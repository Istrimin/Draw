<?php
header('Content-Type: application/json');

$cursorDir = 'cursors/';  // Путь к папке с курсорами
$cursors = array_diff(scandir($cursorDir), array('..', '.'));  // Получаем список файлов, исключая . и ..

echo json_encode($cursors);
