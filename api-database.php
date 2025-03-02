<?php
class DatabaseAPI {
    private $db;

    public function __construct($servername, $username, $password, $dbname, $port) {
        $this->db = new mysqli($servername, $username, $password, $dbname, $port);
        if ($this->db->connect_error) {
            die("Connection failed: " . $this->db->connect_error);
        }        
    }

    public function SecureLogin($email, $password){
        $stmt = $this->db->prepare("SELECT UserId, Email, Role, Password, PasswordSalt FROM users WHERE Email = ? LIMIT 1");
        $stmt->bind_param('s', $email); // esegue il bind del parametro '$email'.
        $stmt->execute(); // esegue la query appena creata.
        $stmt->store_result();
        $stmt->bind_result($user_id, $e_mail, $role, $db_password, $salt); // recupera il risultato della query e lo memorizza nelle relative variabili.
        $stmt->fetch();
        $password = hash('sha512', $password.$salt); // codifica la password usando una chiave univoca.

        $result['success'] = false;

        if($stmt->num_rows == 1) { // se l'utente esiste
            if($db_password == $password) { // Verifica che la password memorizzata nel database corrisponda alla password fornita dall'utente.
                // Password corretta     
                $user_browser = $_SERVER['HTTP_USER_AGENT']; // Recupero il parametro 'user-agent' relativo all'utente corrente.

                // Protezione da attacco XSS
                $user_id = preg_replace("/[^0-9]+/", "", $user_id);
                $_SESSION['user_id'] = $user_id; 
                $email = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $email);
                $_SESSION['email'] = $e_mail;
                $_SESSION['login_string'] = hash('sha512', $password.$user_browser);
                // Login eseguito con successo.

                $result["success"] = true;
                $result["role"] = $role;

                return $result;    
            }
            return $result;
        } else {
            $result["error"] = "userNotExists";
            // L'utente inserito non esiste.
            return $result;
        }
    }

    public function SecureSignup($email, $password, $phoneNum) {
        $stmt = $this->db->prepare("SELECT UserId FROM users WHERE Email = ? LIMIT 1");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows == 1) {
            return false;
        }

        $userRole = 1;
        $budget = 0.00;

        // Crea una chiave casuale
        $random_salt = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
        // Crea una password usando la chiave appena creata.
        $securePassword = hash('sha512', $password.$random_salt);

        // Se la registrazione avviene con una mail istituzionale, vengono donati 100€ di budget iniziale
        $emailStrings = explode('@', $email);
        $emailDom = $emailStrings[count($emailStrings) - 1];

        if (strtolower($emailDom) == "studio.unibo.it") {
            $budget = 100.00;
        }

        // Registrazione utente
        $stmt = $this->db->prepare("INSERT INTO users (`Email`, `Role`, `Password`, `PasswordSalt`, `PhoneNum`, `Budget`) VALUES (?,?,?,?,?,?)");
        $stmt->bind_param('ssssss', $email, $userRole, $securePassword, $random_salt, $phoneNum, $budget);
        $result = $stmt->execute();

        return $result;
    }

    public function GetProducts() {
        $stmt = $this->db->prepare("SELECT ProductId, Name, ShortDesc, LongDesc, Price, PlayerNumFrom, PlayerNumTo, Category, StockQuantity, ImageName FROM products");

        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
    
    public function GetUserCartProducts() {
        $stmt = $this->db->prepare("SELECT p.ProductId, p.Name, p.LongDesc, p.Price, p.PlayerNumFrom, p.PlayerNumTo, p.Category, p.ImageName, c.Quantity FROM carts AS c INNER JOIN products AS p ON c.Product = p.ProductId WHERE c.User = ?");
        $stmt->bind_param('s', $_SESSION['user_id']);

        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function IncreaseUserCartProduct($productId) {
        $stmt = $this->db->prepare("SELECT Quantity FROM carts WHERE User = ? AND Product = ?");
        $stmt->bind_param('ss', $_SESSION['user_id'], $productId);
        $stmt->execute();
        
        $currentQuantity = $stmt->get_result()->fetch_all(MYSQLI_ASSOC)[0]["Quantity"];
        $newQuantity = $currentQuantity + 1;

        $stmt = $this->db->prepare("UPDATE carts SET Quantity = ? WHERE User = ? AND Product = ?");
        $stmt->bind_param('sss', $newQuantity, $_SESSION['user_id'], $productId);
        $stmt->execute();

        return $newQuantity;
    }

    public function DecreaseUserCartProduct($productId) {
        $stmt = $this->db->prepare("SELECT Quantity FROM carts WHERE User = ? AND Product = ?");
        $stmt->bind_param('ss', $_SESSION['user_id'], $productId);
        $stmt->execute();
        
        $currentQuantity = $stmt->get_result()->fetch_all(MYSQLI_ASSOC)[0]["Quantity"];
        $newQuantity = $currentQuantity - 1;

        if ($newQuantity <= 0) {
            $stmt = $this->db->prepare("DELETE FROM carts WHERE User = ? AND Product = ?");
            $stmt->bind_param('ss', $_SESSION['user_id'], $productId);
            $stmt->execute();
        } else {
            $stmt = $this->db->prepare("UPDATE carts SET Quantity = ? WHERE User = ? AND Product = ?");
            $stmt->bind_param('sss', $newQuantity, $_SESSION['user_id'], $productId);
            $stmt->execute();
        }

        return $newQuantity;
    }

    public function CheckoutUserCart() {
        // Ottenimento prodotti del carrello
        $cartProducts = $this->GetUserCartProducts();

        if (count($cartProducts) == 0) {
            return "noProducts";
        }

        // Check prezzo totale del carrello
        $stmt = $this->db->prepare("SELECT SUM(p.Price * c.Quantity) AS Total FROM products AS p INNER JOIN carts AS c ON p.ProductId = c.Product WHERE c.User = ?");
        $stmt->bind_param('s', $_SESSION['user_id'],);
        $stmt->execute();

        $totalPrice = $stmt->get_result()->fetch_all(MYSQLI_ASSOC)[0]['Total'];

        $stmt->close();

        // Check budget utente
        $stmt = $this->db->prepare("SELECT Budget FROM users WHERE UserId = ?");
        $stmt->bind_param('s', $_SESSION['user_id'],);
        $stmt->execute();

        $userBudget = $stmt->get_result()->fetch_all(MYSQLI_ASSOC)[0]['Budget'];

        if ($userBudget < $totalPrice) {
            return "notEnoughBudget";
        }

        $stmt->close();

        // Acquisto
        $remainingBudget = $userBudget - $totalPrice;

        // Aggiornamento budget utente
        $stmt = $this->db->prepare("UPDATE users SET Budget = ? WHERE UserId = ?");
        $stmt->bind_param('ss', $remainingBudget, $_SESSION['user_id'],);
        $stmt->execute();
        $stmt->close();

        // Creazione ordine
        $orderStatus = 1;

        $stmt = $this->db->prepare("INSERT INTO orders (`User`, `Status`) VALUES (?,?)");
        $stmt->bind_param('ss', $_SESSION['user_id'], $orderStatus);
        $stmt->execute();

        // Creazione dettaglio ordine
        $orderId = $stmt->insert_id;

        $stmt->close();

        for ($i = 0; $i < count($cartProducts); $i++) {
            $currentProduct = $cartProducts[$i];
            $rowNum = $i + 1;

            $productId = $currentProduct['ProductId'];
            $price = $currentProduct['Price'];
            $quantity = $currentProduct['Quantity'];

            $totalPrice = $price * $quantity;

            $stmt = $this->db->prepare("INSERT INTO order_details (`Order`, `RowNum`, `Product`, `Quantity`, `TotalPrice`) VALUES (?,?,?,?,?)");
            $stmt->bind_param('sssss', $orderId, $rowNum, $productId, $quantity, $totalPrice);
            $stmt->execute();
            $stmt->close();
            
            // Gestione disponibilità prodotto in magazzino
            $stmt = $this->db->prepare("UPDATE products SET StockQuantity = GREATEST(StockQuantity - ?, 0) WHERE ProductId = ?");
            $stmt->bind_param('ss', $quantity, $productId);
            $stmt->execute();
            $stmt->close();

            // Otteniamo la nuova quantità in magazzino
            $stmt = $this->db->prepare("SELECT StockQuantity FROM products WHERE ProductId = ?");
            $stmt->bind_param('s',$productId);
            $stmt->execute();
            $stmt->bind_result($newStockQuantity);
            $stmt->fetch();
            $stmt->close();

            // Invio notifiche al venditore in caso di quantità bassa o pari a zero
            if ($newStockQuantity == 0) {
                $this->SendNotificationToSeller(3, "Prodotto [".$currentProduct["Name"]."] esaurito", 3);
            } else if ($newStockQuantity <= 3) {
                $this->SendNotificationToSeller(5, "Prodotto [".$currentProduct["Name"]."] in esaurimento", 2);
            }
        }

        // Pulizia del carrello
        $stmt = $this->db->prepare("DELETE FROM carts WHERE User = ?");
        $stmt->bind_param('s', $_SESSION['user_id'],);
        $stmt->execute();
        $stmt->close();

        // Notifica
        $message = "Acquisto effettuato di € ".$totalPrice." ordine #".$orderId;
        $this->SendNotificationToCurrentUser(1, $message);

        return "ok";
    }

    public function GetProductDetails($productId) {
        $stmt = $this->db->prepare("SELECT ProductId, Name, ShortDesc, LongDesc, Price, PlayerNumFrom, PlayerNumTo, Category, StockQuantity, ImageName FROM products WHERE ProductId = ?");
        $stmt->bind_param('s', $productId);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC)[0];
    }

    public function AddProductToCart($productId) {
        $quantity = 1;

        $stmt = $this->db->prepare("INSERT INTO carts (`User`,`Product`,`Quantity`) VALUES (?,?,?)");
        $stmt->bind_param('sss', $_SESSION['user_id'], $productId, $quantity);
        $result = $stmt->execute();

        return $result;
    }

    public function SearchProducts($textFilter, $playerFrom, $playerTo, $maxPrice) {
        $stmt = $this->db->prepare("SELECT ProductId, Name, ShortDesc, LongDesc, Price, PlayerNumFrom, PlayerNumTo, Category, StockQuantity, ImageName FROM products WHERE (Name LIKE CONCAT('%',?,'%') OR ShortDesc LIKE CONCAT('%',?,'%') OR LongDesc LIKE CONCAT('%',?,'%')) AND PlayerNumFrom >= ? AND PlayerNumTo <= ? AND Price <= ?");
        $stmt->bind_param('ssssss', $textFilter, $textFilter, $textFilter, $playerFrom, $playerTo, $maxPrice);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function GetAllOrders() {
        $stmt = $this->db->prepare("SELECT o.OrderId, o.User, o.Status, os.Description FROM orders AS o INNER JOIN order_status AS os ON os.StatusId = o.Status ORDER BY o.User ASC, o.CreationDateTime DESC");
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function GetCurrentUserOrders() {
        $stmt = $this->db->prepare("SELECT o.OrderId, o.User, o.Status, os.Description FROM orders AS o INNER JOIN order_status AS os ON os.StatusId = o.Status WHERE o.User = ? ORDER BY o.CreationDateTime DESC");
        $stmt->bind_param('s', $_SESSION['user_id']);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    //funzione venditore aggiungere un item
    public function AddSellerItem($name, $price, $file, $category, $quantity, $shortDesc, $longDesc) {
        try {
            $stmt = $this->db->prepare("INSERT INTO `products` (`Name`, `ShortDesc`, `LongDesc`, `Price`, `PlayerNumFrom`, `PlayerNumTo`, `Category`, `StockQuantity`, `ImageName`) VALUES (?, ?, ?, ?, 1, 1, ?, ?, ?)");
            $stmt->bind_param('sssssss', $name, $shortDesc, $longDesc, $price, $category, $quantity, $file);
            $stmt->execute();

            return ["success" => true, "message" => "Product added successfully"];
        } catch (Exception $e) {
            return ["success" => false, "message" => "Unable to handle the data"];
        }
    } 

    public function UpdateProduct($ProductId, $Name, $Price, $category, $quantity, $shortDesc, $longDesc){
        // try{
            $stmt = $this->db->prepare("UPDATE `products` SET `Name` = ?, `Price` = ?, `Category` = ?, `StockQuantity` = ?, `ShortDesc` = ?, `LongDesc` = ? WHERE `ProductId` = ?");
            $stmt->bind_param('sssssss', $Name, $Price, $category, $quantity, $shortDesc, $longDesc, $ProductId);
            $stmt->execute();

            return ["success" => true, "message" => "Updated"];

        // } catch(Exception $e){
            // return ["success" => false, "message" => "Unable to Update the Product"];
        // }
    }

    public function ChangeOrderStatus($orderId, $newStatus) {
        $stmt = $this->db->prepare("UPDATE orders SET `Status` = ? WHERE OrderId = ?");
        $stmt->bind_param('ss', $newStatus, $orderId);
        $success = $stmt->execute();
        $stmt->close();

        if (!$success) return false;

        $stmt = $this->db->prepare("SELECT o.User, os.Description FROM orders AS o INNER JOIN order_status AS os ON o.Status = os.StatusId WHERE o.OrderId = ?");
        $stmt->bind_param('s', $orderId);
        $stmt->execute();
        $stmt->bind_result($targetUser, $newStatusDesc);
        $stmt->fetch();
        $stmt->close();

        $this->SendNotificationToUser($targetUser, 2, "Lo stato dell'ordine #".$orderId." è stato impostato su [".$newStatusDesc."]");

        return $success;
    }

    public function GetOrderDetails($orderId) {
        $stmt = $this->db->prepare("SELECT od.RowNum, od.Product, od.Quantity, od.TotalPrice, p.Name FROM order_details AS od INNER JOIN products AS p ON od.Product = p.ProductId WHERE `Order` = ?");
        $stmt->bind_param('s', $orderId);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function GetUserBudgetDetails() {
        $stmt = $this->db->prepare("SELECT Budget FROM users WHERE UserId = ?");
        $stmt->bind_param('s', $_SESSION['user_id']);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC)[0];
    }

    public function ChargeUserWallet($money) {
        $stmt = $this->db->prepare("UPDATE users SET Budget = Budget + ? WHERE UserId = ?");
        $stmt->bind_param('ss', $money, $_SESSION['user_id']);
        $success = $stmt->execute();

        $stmt = $this->db->prepare("SELECT Budget FROM users WHERE UserId = ?");
        $stmt->bind_param('s', $_SESSION['user_id']);
        $stmt->execute();
        $stmt->bind_result($newBudget);
        $stmt->fetch();

        $result["success"] = $success;
        $result["newBudget"] = $newBudget;

        return $result;
    }

    public function WithdrawUserWallet($money) {
        $stmt = $this->db->prepare("SELECT u.Budget FROM users AS u WHERE u.UserId = ?");
        $stmt->bind_param('s', $_SESSION['user_id']);
        $stmt->execute();
        $stmt->bind_result($userBudget);
        $stmt->fetch();
        $stmt->close();

        if ($userBudget < $money) {
            $result["success"] = false;
            $result["error"] = "notEnoughBudget";

            return $result;
        }

        $stmt = $this->db->prepare("UPDATE users SET Budget = GREATEST(Budget - ?, 0) WHERE UserId = ?");
        $stmt->bind_param('ss', $money, $_SESSION['user_id']);
        $success = $stmt->execute();
        $stmt->close();

        $stmt = $this->db->prepare("SELECT Budget FROM users WHERE UserId = ?");
        $stmt->bind_param('s', $_SESSION['user_id']);
        $stmt->execute();
        $stmt->bind_result($newBudget);
        $stmt->fetch();
        $stmt->close();

        $result["success"] = $success;
        $result["newBudget"] = $newBudget;

        return $result;
    }

    // $user: Utente a cui inviare la notifica
    // $type: Tipo di notifica (vedi db)
    // $message: Messaggio della notifica
    // $alertType: Tipo di "alert" della notifica (vedi db), di default = 1 ("info")
    public function SendNotificationToUser($user, $type, $message, $alertType = 1) {
        $stmt = $this->db->prepare("INSERT INTO notifications (`User`,`Type`,`AlertType`,`Description`) VALUES (?,?,?,?)");
        $stmt->bind_param('ssss', $user, $type, $alertType, $message);
        $success = $stmt->execute();

        return $success;
    }

    public function SendNotificationToCurrentUser($type, $message, $alertType = 1) {
        return $this->SendNotificationToUser($_SESSION['user_id'], $type, $message, $alertType);
    }

    public function SendNotificationToSeller($type, $message, $alertType = 1) {
        $stmt = $this->db->prepare("SELECT UserId FROM users WHERE `Role` = 0 LIMIT 1");
        $stmt->execute();
        $stmt->bind_result($sellerUserId);
        $stmt->fetch();
        $stmt->close();

        $stmt = $this->db->prepare("INSERT INTO notifications (`User`,`Type`,`AlertType`,`Description`) VALUES (?,?,?,?)");
        $stmt->bind_param('ssss', $sellerUserId, $type, $alertType, $message);
        $success = $stmt->execute();

        return $success;
    }

    public function GetUserNotifications() {
        $stmt = $this->db->prepare("SELECT n.NotificationId, n.Description AS `Message`, n.Viewed, n.CreationDateTime, nt.TypeId, nt.Description AS TypeDesc, nat.AlertTypeId, nat.Description AS AlertTypeDesc FROM notifications AS n INNER JOIN notification_types AS nt ON n.Type = nt.TypeId INNER JOIN notification_alert_types AS nat ON n.AlertType = nat.AlertTypeId WHERE n.User = ? ORDER BY n.Viewed ASC, n.CreationDateTime DESC");
        $stmt->bind_param('s', $_SESSION['user_id']);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function ChangeNotificationViewedStatus($notificationId, $viewed) {
        $stmt = $this->db->prepare("UPDATE notifications SET Viewed = ? WHERE NotificationId = ?");
        $stmt->bind_param('ss', $viewed, $notificationId);
        $success = $stmt->execute();

        return $success;
    }

    public function DeleteNotification($notificationId) {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE NotificationId = ?");
        $stmt->bind_param('s', $notificationId);
        $success = $stmt->execute();

        return $success;
    }

    public function PollForNewNotification($previousDateTime) {
        $stmt = $this->db->prepare("SELECT n.NotificationId, n.Description AS `Message`, n.Viewed, n.CreationDateTime, nt.TypeId, nt.Description AS TypeDesc, nat.AlertTypeId, nat.Description AS AlertTypeDesc FROM notifications AS n INNER JOIN notification_types AS nt ON n.Type = nt.TypeId INNER JOIN notification_alert_types AS nat ON n.AlertType = nat.AlertTypeId WHERE n.User = ? AND n.CreationDateTime > ? LIMIT 1");
        $stmt->bind_param('ss', $_SESSION['user_id'], $previousDateTime);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function GetAllCustomerUsers() {
        $stmt = $this->db->prepare("SELECT UserId, Email FROM users WHERE `Role` = 1");
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function GetUserOrders($userId) {
        $stmt = $this->db->prepare("SELECT o.OrderId, o.User, o.Status, os.Description FROM orders AS o INNER JOIN order_status AS os ON os.StatusId = o.Status WHERE o.User = ? ORDER BY o.CreationDateTime DESC");
        $stmt->bind_param('s', $userId);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function GetAllOrderStatus() {
        $stmt = $this->db->prepare("SELECT StatusId, Description FROM order_status");
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function GetAllProductCategories() {
        $stmt = $this->db->prepare("SELECT CategoryId, Description FROM product_categories");
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function SecureLogout() {
        $_SESSION['user_id'] = '';
        $_SESSION['email'] = '';
        $_SESSION['login_string'] = '';

        return true;
    }
}
?>