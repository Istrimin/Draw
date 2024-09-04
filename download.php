<?php
header('Content-Disposition: attachment; filename="Virago.mp3"');
header('Content-Type: audio/mpeg');
readfile('music/Virago.mp3');
?>
