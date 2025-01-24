SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `elab` DEFAULT CHARACTER SET utf8 ;
USE `elab` ;

CREATE TABLE IF NOT EXISTS `elab`.`roles` (
    `RoleId` INT NOT NULL,
    `Description` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`RoleId`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`users` (
    `UserId` INT NOT NULL AUTO_INCREMENT,
    `Email` VARCHAR(100) NOT NULL,
    `Role` INT NOT NULL,
    `Password` VARCHAR(128) NOT NULL,
    `PasswordSalt` VARCHAR(128) NOT NULL,
    `PhoneNum` VARCHAR(20) NULL,
    `Active` TINYINT NULL DEFAULT 0,
    `Budget` DECIMAL(10,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (`UserId`),
    CONSTRAINT `fk_users_roles`
        FOREIGN KEY (`Role`)
        REFERENCES `elab`.`roles` (`RoleId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`product_categories` (
    `CategoryId` INT NOT NULL AUTO_INCREMENT,
    `Description` VARCHAR(20) NOT NULL,
    PRIMARY KEY(`CategoryId`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`products` (
    `ProductId` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(70) NOT NULL,
    `ShortDesc` VARCHAR(200) NOT NULL,
    `LongDesc` VARCHAR(1000) NOT NULL,
    `Price` DECIMAL(10,2) NOT NULL,
    `PlayerNumFrom` SMALLINT NOT NULL DEFAULT 1,
    `PlayerNumTo` SMALLINT NOT NULL DEFAULT 1,
    `Category` INT NOT NULL,
    `StockQuantity` INT NOT NULL DEFAULT 0,
    `ImageName` VARCHAR(256) NOT NULL,
    PRIMARY KEY (`ProductId`),
    CONSTRAINT `fk_products_categories`
        FOREIGN KEY (`Category`)
        REFERENCES `elab`.`product_categories` (`CategoryId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`carts` (
    `User` INT NOT NULL,
    `Product` INT NOT NULL,
    `Quantity` INT NOT NULL DEFAULT 1,
    PRIMARY KEY(`User`, `Product`),
    CONSTRAINT `fk_carts_users`
        FOREIGN KEY (`User`)
        REFERENCES `elab`.`users` (`UserId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_carts_products`
        FOREIGN KEY (`Product`)
        REFERENCES `elab`.`products` (`ProductId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`notification_types` (
    `TypeId` INT NOT NULL AUTO_INCREMENT,
    `Description` VARCHAR(100) NOT NULL,
    PRIMARY KEY(`TypeId`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`notification_alert_types` (
    `AlertTypeId` INT NOT NULL AUTO_INCREMENT,
    `Description` VARCHAR(20) NOT NULL,
    PRIMARY KEY(`AlertTypeId`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`notifications` (
    `NotificationId` INT NOT NULL AUTO_INCREMENT,
    `User` INT NOT NULL,
    `Type` INT NOT NULL,
    `AlertType` INT NOT NULL,
    `Description` VARCHAR(200) NOT NULL,
    `Viewed` BOOLEAN NOT NULL DEFAULT 0,
    `CreationDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`NotificationId`),
    INDEX `fk_notifications_users_idx` (`User` ASC),
    CONSTRAINT `fk_notifications_users`
        FOREIGN KEY (`User`)
        REFERENCES `elab`.`users` (`UserId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_notifications_types`
        FOREIGN KEY (`Type`)
        REFERENCES `elab`.`notification_types` (`TypeId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_notifications_alert_types`
        FOREIGN KEY (`AlertType`)
        REFERENCES `elab`.`notification_alert_types` (`AlertTypeId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`order_status` (
    `StatusId` INT NOT NULL AUTO_INCREMENT,
    `Description` VARCHAR(20) NOT NULL,
    PRIMARY KEY(`StatusId`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`orders` (
    `OrderId` INT NOT NULL AUTO_INCREMENT,
    `User` INT NOT NULL,
    `Status` INT NOT NULL,
    `CreationDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`OrderId`),
    INDEX `fk_orders_users_idx` (`User` ASC),
    CONSTRAINT `fk_orders_users`
        FOREIGN KEY (`User`)
        REFERENCES `elab`.`users` (`UserId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_orders_status`
        FOREIGN KEY (`Status`)
        REFERENCES `elab`.`order_status` (`StatusId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `elab`.`order_details` (
    `Order` INT NOT NULL,
    `RowNum` INT NOT NULL,
    `Product` INT NOT NULL,
    `Quantity` INT NOT NULL,
    `TotalPrice` DECIMAL(10,2) NOT NULL DEFAULT 0,
    PRIMARY KEY(`Order`, `RowNum`),
    INDEX `fk_orders_products_idx` (`Product` ASC),
    CONSTRAINT `fk_order_details_orders`
        FOREIGN KEY (`Order`)
        REFERENCES `elab`.`orders` (`OrderId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_order_details_products`
        FOREIGN KEY (`Product`)
        REFERENCES `elab`.`products` (`ProductId`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;