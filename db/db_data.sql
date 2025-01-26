INSERT INTO `roles`
(`RoleId`, `Description`)
VALUES
(0, 'Seller'),
(1, 'Customer');

INSERT INTO `users`
(`Email`, `Role`, `Password`, `PasswordSalt`, `PhoneNum`, `Active`, `Budget`)
VALUES
('ale.2000.ar26@gmail.com', 0, 'f3cbd7d0648f5931d0425c179e93d63d833e44804619e7695d455ef6d4438f381996ab9e7c0bda2c0a790a5e33bd2ccc2c5974457821811ebcaad5708e0afe59', '96d6f244f2dcac51dc444395d48d72e1dc83be972c2805d32da3d02538c88b787b077874f0bb1fd182a1fabbe68f46a3c9d59ec016862cf884ee2b7c20843158', NULL, 0, 0),
('test.prova@gmail.com', 1, '3f0df3448b52b530c9f90dea4b20f0391e4cf0709b61f86c51cd668323ae3fabae42847c6fd96788dcd957dbb4af0ba5ec063a079eb92fef48805b1fa24a3524', '80f3297da5f583c659b7687e5ee9ba3fbb98b9b51b905af98b02fbe745417a482b286eb758605171782fb7208647a692d78bf7a0475f12450bba1d98227c5356', NULL, 0, 2000.00);

INSERT INTO `product_categories`
(`CategoryId`, `Description`)
VALUES
(1, 'Gioco da tavolo'),
(2, 'Gioco di carte'),
(3, 'Rompicapo');

INSERT INTO `products`
(`ProductId`, `Name`, `ShortDesc`, `LongDesc`, `Price`, `PlayerNumFrom`, `PlayerNumTo`, `Category`, `StockQuantity`, `ImageName`)
VALUES
(1, 'Monopoly', 'Il classico Monopoly', 'Il gioco da tavolo più venduto al mondo. Prodotto da Hasbro.', 29.99, 2, 4, 1, 10, 'Monopoly.jpg'),
(2, 'UNO', 'Il Classico UNO', 'Il gioco di carte più famoso al mondo, amato da grandi e piccini.', 7.99, 2, 10, 2, 8, 'uno.jpg'),
(3, 'Carte Romagnole', 'Mazzo unico', 'Le carte "Must Have" per una pausa pranzo indimenticabile con i tuoi colleghi.', 5.99, 2, 4, 2, 10, 'carteromagnole.jpg'),
(4, 'Risiko', 'Gioco di strategia', 'Uno dei giochi da tavolo più apprezzato dagli amanti della strategia.', 29.99, 3, 6, 1, 10, 'risiko.jpg'),
(5, 'Exploding Kittens', 'Gioco di carte con gattini', 'ATTENZIONE! Gatti esplosivi in vista. Armati delle carte più folli e potenti per sopravvivere alle esplosioni.', 19.99, 2, 8, 2, 20, 'Exploding Kittens.jpg'),
(6, 'Cubo di Rubik', 'Il rompicapo più famoso', 'Un ottimo passatempo e metodo di allenamento per la mente', 4.99, 1, 1, 3, 30, 'Cubo Rubik.png'),
(7, 'Jenga', 'La torre di legno', 'Costruisci la torre di legno più alta e complessa che puoi, sfida i tuoi amici ad estrarre i pezzi senza farla cadere', 15.99, 1, 4, 3, 20, 'jenga.jpg');

INSERT INTO `notification_types`
(`TypeId`, `Description`)
VALUES
(1, 'Ordine effettuato'),
(2, 'Ordine modificato'),
(3, 'Prodotto esaurito'),
(4, 'Disponibilità modificata'),
(5, 'Prodotto in esaurimento');

INSERT INTO `notification_alert_types`
(`AlertTypeId`, `Description`)
VALUES
(1, 'Info'),
(2, 'Success'),
(3, 'Warning'),
(4, 'Error');

INSERT INTO `order_status`
(`StatusId`, `Description`)
VALUES
(1, 'Da spedire'),
(2, 'In spedizione'),
(3, 'Cancellato'),
(4, 'Arrivato');