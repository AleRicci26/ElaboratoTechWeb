<?php
require_once 'startup.php';

$result = $db->GetAllProductCategories();

header('Content-Type: application/json');
echo json_encode($result);
?>