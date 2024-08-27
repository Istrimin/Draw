<?php
header('Content-Type: application/json');

$cursorDir = 'cursors/';
if (!is_dir($cursorDir)) {
    echo json_encode(['error' => 'Cursor directory not found']);
    exit;
}

$cursors = array_diff(scandir($cursorDir), array('..', '.'));
if (empty($cursors)) {
    echo json_encode(['error' => 'No cursors found']);
    exit;
}

echo json_encode($cursors);
