<?php
    require_once 'startup.php';

    if (isset($_FILES['file']) && isset($_POST['name']) && isset($_POST['price'])) {
        $name = $_POST['name'];
        $price = $_POST['price'];
        $file = $_FILES['file']['name'];
        $target_dir = UPLOAD_DIR;
        $target_file = $target_dir . basename($file);
    
        // Move the uploaded file to the target directory
        if (move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
            $result = $db->AddSellerItem($name, $price, $file);
        } else {
            $result = ["success" => false, "message" => "Failed to upload file"];
        }
    } else {
        $result = ["success" => false, "message" => "Invalid input"];
    }
    
    header('Content-Type: application/json');
    echo json_encode($result);
    ?>
?>