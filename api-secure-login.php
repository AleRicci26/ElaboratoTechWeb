<?php
require_once 'startup.php';

$result["success"] = false;

if (isset($_POST["email"]) && isset($_POST["password"])) {
    $checkLoginResult = $db->SecureLogin($_POST["email"], $_POST["password"]);

    if ($checkLoginResult) {
        $result["success"] = true;
    }
}
//test git Lucas conflitto

header('Content-Type: application/json');
echo json_encode($result);
?>