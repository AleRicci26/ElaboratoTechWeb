<?php
require_once 'startup.php';

$result = $db->UpdateProduct($_POST["ProductId"], $_POST['Name'], $_POST['Price']);

header('Content-Type: application/json');
echo json_encode($result);
?>