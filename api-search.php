<?php
require_once 'startup.php';

$result = $db->SearchProducts($_POST["TextFilter"], $_POST["PlayerFrom"], $_POST["PlayerTo"], $_POST["MaxPrice"]);

for($i = 0; $i < count($result); $i++){
    $result[$i]["ImageName"] = UPLOAD_DIR.$result[$i]["ImageName"];
}

header('Content-Type: application/json');
echo json_encode($result);
?>