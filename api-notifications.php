<?php
require_once 'startup.php';

// Visualizza tutte le notifiche
if ($_POST["action"] == 1) {
    $result = $db->GetUserNotifications();
}
// Modifica lo stato "già letto" di una notifica
if ($_POST["action"] == 2) {
    $result = $db->ChangeNotificationViewedStatus($_POST["NotificationId"], $_POST["Viewed"]);
}
// Cancella una notifica
if ($_POST["action"] == 3) {
    $result = $db->DeleteNotification($_POST["NotificationId"]);
}
// Visualizza un'eventuale nuova notifica
if ($_POST["action"] == 4) {
    $result = $db->PollForNewNotification($_POST["PreviousDateTime"]);
}

header('Content-Type: application/json');
echo json_encode($result);
?>