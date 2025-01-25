<?php
require_once 'startup.php';

$result = $db->GetProductDetails($_POST["ProductId"]);

header('Content-Type: application/json');
echo json_encode($result);
?>