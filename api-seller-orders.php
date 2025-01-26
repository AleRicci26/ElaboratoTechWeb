<?php
require_once 'startup.php';

// Visualizza tutti gli utenti
if ($_POST["action"] == 1) {
    $result = $db->GetAllCustomerUsers();
}
// Visualizza tutti gli ordini di un utente
if ($_POST["action"] == 2) {
    $result = $db->GetUserOrders($_POST["UserId"]);
}
// Modifica lo stato di un ordine
if ($_POST["action"] == 3) {
    $result = $db->ChangeOrderStatus($_POST["OrderId"], $_POST["StatusId"]);
}
// Ottiene tutti i possibili stati degli ordini
if ($_POST["action"] == 4) {
    $result = $db->GetAllOrderStatus();
}

header('Content-Type: application/json');
echo json_encode($result);
?>