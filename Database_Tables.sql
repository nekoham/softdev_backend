CREATE TABLE `users` (
  `uid` integer PRIMARY KEY AUTO_INCREMENT,
  `user_email` varchar(255) UNIQUE,
  `user_name` varchar(255),
  `con_num` varchar(255),
  `first_name` varchar(255),
  `last_name` varchar(255),
  `password` varchar(255),
  `review_score` float,
  `review_count` integer,
  `boosting_success` integer,
  `selling_success` integer
);

CREATE TABLE `SellOrder` (
  `orderID` integer PRIMARY KEY AUTO_INCREMENT,
  `sid` integer,
  `bid` integer,
  `account_email` varchar(255),
  `account_password` varchar(255),
  `order_name` varchar(255),
  `skin_num` integer,
  `tier` varchar(255),
  `win_rate` varchar(255),
  `gold` integer,
  `diamond` integer,
  `marble` integer,
  `coupon` integer,
  `price` integer,
  `hero_num` integer,
  `image` text,
  `status` text,
  `datetime` date
);

CREATE TABLE `BoosterDetail` (
  `boosterID` integer PRIMARY KEY AUTO_INCREMENT,
  `uid` integer,
  `booster_email` varchar(255),
  `address` text,
  `province` text,
  `postcode` varchar(255),
  `facebook` varchar(255),
  `line` varchar(255),
  `tier` varchar(255),
  `star_price` varchar(255),
  `max_tier` varchar(255),
  `winrate` integer,
  `card_pic` text,
  `face_pic` text,
  `promote_pic` text,
  `status` integer,
  `Boosting_number` integer,
  `birthDay` date
);

CREATE TABLE `BoostOrder` (
  `boostingID` integer PRIMARY KEY AUTO_INCREMENT,
  `boid` integer,
  `eid` integer,
  `price` integer,
  `status` text,
  `datetime` date
);

CREATE TABLE `BoostReportConfirm` (
  `boostingID` integer PRIMARY KEY,
  `start_pic` text,
  `after_pic` text,
  `uid` integer,
  `before_tier` varchar(255),
  `before_gold` integer,
  `before_diamond` integer,
  `before_marble` integer,
  `before_coupon` integer,
  `after_tier` varchar(255),
  `after_gold` integer,
  `after_diamond` integer,
  `after_marble` integer,
  `after_coupon` integer,
  `facebook` varchar(255),
  `line` varchar(255),
  `side` varchar(255),
  `datetime` date
);

CREATE TABLE `BuyerReport` (
  `orderID` integer PRIMARY KEY,
  `pic` text,
  `detail` text,
  `uid` integer,
  `facebook` varchar(255),
  `line` varchar(255)
);

ALTER TABLE `SellOrder` ADD FOREIGN KEY (`sid`) REFERENCES `users` (`uid`);

ALTER TABLE `SellOrder` ADD FOREIGN KEY (`bid`) REFERENCES `users` (`uid`);

ALTER TABLE `BoosterDetail` ADD FOREIGN KEY (`uid`) REFERENCES `users` (`uid`);

ALTER TABLE `BoostOrder` ADD FOREIGN KEY (`boid`) REFERENCES `users` (`uid`);

ALTER TABLE `BoostOrder` ADD FOREIGN KEY (`eid`) REFERENCES `users` (`uid`);

ALTER TABLE `BoostReportConfirm` ADD FOREIGN KEY (`boostingID`) REFERENCES `BoostOrder` (`boostingID`);

ALTER TABLE `BuyerReport` ADD FOREIGN KEY (`orderID`) REFERENCES `SellOrder` (`orderID`);

ALTER TABLE `BuyerReport` ADD FOREIGN KEY (`uid`) REFERENCES `users` (`uid`);

ALTER TABLE `BoostReportConfirm` ADD FOREIGN KEY (`uid`) REFERENCES `users` (`uid`);
