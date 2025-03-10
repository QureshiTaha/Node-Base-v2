CREATE TABLE `db_users` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `userID` varchar(100) NOT NULL,
 `userFirstName` varchar(100) NOT NULL,
 `userSurname` varchar(100) NOT NULL,
 `userEmail` varchar(50) NOT NULL,
 `userPassword` varchar(255) NOT NULL,
 `userPhone` varchar(11) DEFAULT NULL,
 `userAddressLine1` varchar(255) NOT NULL,
 `userAddressLine2` varchar(255) NOT NULL,
 `userAddressPostcode` varchar(255) NOT NULL,
 `userGender` varchar(255) NOT NULL,
 `userDateOfBirth` date DEFAULT NULL,
 `userRole` tinyint(11) NOT NULL DEFAULT 1,
 `userDateJoined` date DEFAULT current_timestamp(),
 `userDateUpdated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `userLastLoggedIn` date DEFAULT NULL,
 `userAccountApproved` tinyint(4) DEFAULT 1,
 `userDeleted` tinyint(4) DEFAULT NULL,
 `userDeletedDate` datetime DEFAULT NULL,
 `userMeta` longtext DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `userID` (`userID`)
);

CREATE TABLE `db_sessions` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `userID` varchar(100) NOT NULL,
 `sessionToken` varchar(255) NOT NULL,
 `expiresAt` datetime NOT NULL,
 PRIMARY KEY (`id`),
 KEY `userID` (`userID`),
 CONSTRAINT `db_sessions_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `db_users` (`userID`) ON DELETE CASCADE
);


CREATE TABLE `db_uploads` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `userID` varchar(100) NOT NULL,
 `filePath` varchar(100) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `user-upload-relation` (`userID`),
 CONSTRAINT `user-upload-relation` FOREIGN KEY (`userID`) REFERENCES `db_users` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


INSERT INTO `db_users` (`id`, `userID`, `userFirstName`, `userSurname`, `userEmail`, `userPassword`, `userPhone`, `userAddressLine1`, `userAddressLine2`, `userAddressPostcode`, `userGender`, `userDateOfBirth`, `userRole`, `userDateJoined`, `userDateUpdated`, `userLastLoggedIn`, `userAccountApproved`, `userDeleted`, `userDeletedDate`, `userMeta`) VALUES
(1, '0ddc7770-bb8f-4308-aad5-4e483770fd07', 'Testing', 'Dev', 'testing@dev.com', '$2b$10$AoLSic7y3KUs8mhYesWBoOCOPcXSlwDyNCHJCdagpMjETnVDU8iUW', 1234567890, 'Address 1', 'Address 2', 'DEV004', '1', '2000-06-24', 0, '2023-08-05', NULL, NULL, 1, NULL, NULL, '{\"hairColour\":\"maroon\"}');

