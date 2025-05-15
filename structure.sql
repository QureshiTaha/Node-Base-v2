CREATE TABLE
    `db_users` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `userID` VARCHAR(100) NOT NULL,
        `userFirstName` VARCHAR(100) NOT NULL,
        `userSurname` VARCHAR(100) NOT NULL,
        `userEmail` VARCHAR(50) NOT NULL,
        `userPassword` VARCHAR(255) NOT NULL,
        `userPhone` VARCHAR(11) DEFAULT NULL,
        `userAddressLine1` VARCHAR(255) NOT NULL,
        `userAddressLine2` VARCHAR(255) NOT NULL,
        `userAddressPostcode` VARCHAR(255) NOT NULL,
        `userGender` VARCHAR(255) NOT NULL,
        `userDateOfBirth` DATE DEFAULT NULL,
        `userRole` tinyint (11) NOT NULL DEFAULT 1,
        `userDateJoined` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        `userDateUpdated` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        `userLastLoggedIn` DATE DEFAULT NULL,
        `userAccountApproved` tinyint (4) DEFAULT 1,
        `userDeleted` tinyint (4) DEFAULT NULL,
        `userDeletedDate` datetime DEFAULT NULL,
        `fcmToken` VARCHAR(255) DEFAULT NULL,
        `userMeta` longtext DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `userID` (`userID`)
    );

INSERT INTO
    `db_users` (
        `id`,
        `userID`,
        `userFirstName`,
        `userSurname`,
        `userEmail`,
        `userPassword`,
        `userPhone`,
        `userAddressLine1`,
        `userAddressLine2`,
        `userAddressPostcode`,
        `userGender`,
        `userDateOfBirth`,
        `userRole`,
        `userDateJoined`,
        `userDateUpdated`,
        `userLastLoggedIn`,
        `userAccountApproved`,
        `userDeleted`,
        `userDeletedDate`,
        `userMeta`
    )
VALUES
    (
        1,
        '0ddc7770-bb8f-4308-aad5-4e483770fd07',
        'Testing',
        'Dev',
        'testing@dev.com',
        '$2b$10$AoLSic7y3KUs8mhYesWBoOCOPcXSlwDyNCHJCdagpMjETnVDU8iUW',
        1234567890,
        'Address 1',
        'Address 2',
        'DEV004',
        '1',
        '2000-06-24',
        0,
        '2023-08-05',
        NULL,
        NULL,
        1,
        NULL,
        NULL,
        '{\"hairColour\":\"maroon\"}'
    );

CREATE TABLE
    `db_sessions` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `userID` VARCHAR(100) NOT NULL,
        `refreshToken` text NOT NULL,
        `accessToken` text NOT NULL,
        `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    `db_uploads` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `userID` VARCHAR(100) NOT NULL,
        `filePath` VARCHAR(100) NOT NULL,
        PRIMARY KEY (`id`),
        KEY `user-upload-relation` (`userID`),
        CONSTRAINT `user-upload-relation` FOREIGN KEY (`userID`) REFERENCES `db_users` (`userID`) ON DELETE CASCADE
    );

CREATE TABLE
    `db_tasks` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `taskID` VARCHAR(100) NOT NULL,
        `taskProjectID` VARCHAR(100) NOT NULL,
        `title` VARCHAR(255) NOT NULL,
        `description` text DEFAULT NULL,
        `created_by` VARCHAR(100) NOT NULL,
        `status` enum (
            'not_assigned',
            'pending',
            'in_progress',
            'completed'
        ) DEFAULT 'not_assigned',
        `priority` enum ('low', 'medium', 'high') DEFAULT 'medium',
        `due_date` datetime DEFAULT NULL,
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        PRIMARY KEY (`id`),
        UNIQUE KEY `taskId` (`taskID`),
        KEY `user-task-relation` (`created_by`),
        CONSTRAINT `user-task-relation` FOREIGN KEY (`created_by`) REFERENCES `db_users` (`userID`)
    );

CREATE TABLE
    `db_task_assignments` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `task_id` VARCHAR(100) NOT NULL,
        `assigned_by` VARCHAR(100) NOT NULL,
        `assigned_to` VARCHAR(100) NOT NULL,
        `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        `message` VARCHAR(100) DEFAULT NULL,
        PRIMARY KEY (`id`),
        KEY `task-assignment-relation` (`task_id`),
        KEY `user-Assignment-r1` (`assigned_by`),
        KEY `user-Assignment-r2` (`assigned_to`)
    );

CREATE TABLE
    `db_projects` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `projectID` VARCHAR(100) NOT NULL,
        `name` VARCHAR(50) NOT NULL,
        `description` text NOT NULL,
        `project_meta` VARCHAR(200) NOT NULL,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    `db_logs` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `logID` VARCHAR(50) NOT NULL,
        `userID` VARCHAR(100) NOT NULL,
        `taskID` VARCHAR(100) NOT NULL,
        `log_type` enum ('system', 'user') NOT NULL DEFAULT 'system',
        `message` longtext NOT NULL,
        `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    `db_reels` (
        `id` int (11) NOT NULL AUTO_INCREMENT,
        `reelId` varchar(100) NOT NULL,
        `filepath` varchar(255) NOT NULL,
        `userID` varchar(100) NOT NULL,
        `title` varchar(100) DEFAULT 'untitled',
        `description` varchar(100) NOT NULL,
        `likes` bigint (20) DEFAULT 0,
        `comments` int (11) NOT NULL DEFAULT 0,
        `isArchive` enum ('0', '1') NOT NULL DEFAULT '0',
        `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`id`),
        KEY `user-reel-relation` (`userID`),
        CONSTRAINT `user-reel-relation` FOREIGN KEY (`userID`) REFERENCES `db_users` (`userID`)
    );

CREATE TABLE
    `db_reel_comments` (
        `commentId` varchar(255) NOT NULL,
        `reelId` varchar(255) NOT NULL,
        `userID` varchar(255) NOT NULL,
        `commentText` text NOT NULL,
        `commentedAt` datetime DEFAULT current_timestamp(),
        PRIMARY KEY (`commentId`)
    );

CREATE TABLE
    `db_reel_likes` (
        `id` int (11) NOT NULL AUTO_INCREMENT,
        `userID` varchar(255) DEFAULT NULL,
        `reelId` varchar(255) DEFAULT NULL,
        `timeStamp` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`)
    );
