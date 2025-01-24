<?php
require_once 'startup.php';

$result["success"] = false;

if (isset($_POST["email"]) && isset($_POST["password"])) {
    if ($db->SecureSignup($_POST["email"], $_POST["password"], $_POST["phoneNum"])) {
        $result["success"] = true;
    } else {
        $result["error"] = "Utente già esistente";
    }
}

header('Content-Type: application/json');
echo json_encode($result);
?>