<?php
require_once 'startup.php';

$result = "";

if (isset($_POST['ProductId'])) {
    $category = $_POST['category'];
    $quantity = $_POST['quantity'];
    $shortDesc = $_POST['shortDesc'];
    $longDesc = $_POST['longDesc'];

    $result = $db->UpdateProduct($_POST["ProductId"], $_POST['Name'], $_POST['Price'], $category, $quantity, $shortDesc, $longDesc);
}

header('Content-Type: application/json');
echo json_encode($result);
?>