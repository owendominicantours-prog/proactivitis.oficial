-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` VARCHAR(191) NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgencyProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `AgencyProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `tourId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CONFIRMED',
    `source` VARCHAR(191) NOT NULL DEFAULT 'WEB',
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `paxAdults` INTEGER NOT NULL DEFAULT 1,
    `paxChildren` INTEGER NOT NULL DEFAULT 0,
    `passengers` INTEGER NULL,
    `pickup` VARCHAR(191) NULL,
    `hotel` VARCHAR(191) NULL,
    `pickupNotes` VARCHAR(191) NULL,
    `totalAmount` DOUBLE NOT NULL,
    `stripe_session_id` VARCHAR(191) NULL,
    `stripe_payment_intent_id` VARCHAR(191) NULL,
    `stripe_checkout_url` VARCHAR(191) NULL,
    `payment_status` VARCHAR(191) NULL,
    `supplierAmount` DOUBLE NULL,
    `platformFee` DOUBLE NULL,
    `agencyFee` DOUBLE NULL,
    `startTime` VARCHAR(191) NULL,
    `cancellationReason` VARCHAR(191) NULL,
    `cancellationByRole` VARCHAR(191) NULL,
    `cancellationAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'SUPPORT',
    `reservationId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conversation_reservationId_key`(`reservationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversationParticipant` (
    `conversationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL DEFAULT 'MEMBER',

    PRIMARY KEY (`conversationId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandingPage` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LandingPage_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `senderRole` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `role` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `body` VARCHAR(191) NULL,
    `bookingId` VARCHAR(191) NULL,
    `metadata` VARCHAR(191) NULL,
    `caseNumber` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnerApplication` (
    `id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NOT NULL,
    `contactRole` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `serviceTypes` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `documentName` VARCHAR(191) NULL,
    `documentUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offer` (
    `id` VARCHAR(191) NOT NULL,
    `tourId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `shortDescription` VARCHAR(191) NULL,
    `heroImage` VARCHAR(191) NULL,

    UNIQUE INDEX `Country_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destination` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDescription` VARCHAR(191) NULL,
    `heroImage` VARCHAR(191) NULL,
    `countryId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Destination_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupplierProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `SupplierProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tour` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `priceChild` DOUBLE NULL,
    `priceYouth` DOUBLE NULL,
    `duration` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `shortDescription` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `physicalLevel` VARCHAR(191) NULL,
    `minAge` INTEGER NULL,
    `accessibility` VARCHAR(191) NULL,
    `confirmationType` VARCHAR(191) NULL,
    `timeOptions` VARCHAR(191) NULL,
    `operatingDays` VARCHAR(191) NULL,
    `blackoutDates` VARCHAR(191) NULL,
    `capacity` INTEGER NULL,
    `meetingPoint` VARCHAR(191) NULL,
    `meetingInstructions` VARCHAR(191) NULL,
    `pickup` VARCHAR(191) NULL,
    `requirements` VARCHAR(191) NULL,
    `cancellationPolicy` VARCHAR(191) NULL,
    `terms` VARCHAR(191) NULL,
    `language` VARCHAR(191) NOT NULL,
    `includes` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `adminNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gallery` VARCHAR(191) NULL,
    `heroImage` VARCHAR(191) NULL,
    `departureDestinationId` VARCHAR(191) NULL,
    `platformSharePercent` INTEGER NOT NULL DEFAULT 20,

    UNIQUE INDEX `Tour_slug_key`(`slug`),
    UNIQUE INDEX `Tour_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER',
    `supplierApproved` BOOLEAN NOT NULL DEFAULT false,
    `agencyApproved` BOOLEAN NOT NULL DEFAULT false,
    `accountStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `statusMessage` VARCHAR(191) NULL,
    `rejectionAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgencyProfile` ADD CONSTRAINT `AgencyProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_tourId_fkey` FOREIGN KEY (`tourId`) REFERENCES `Tour`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerApplication` ADD CONSTRAINT `PartnerApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offer` ADD CONSTRAINT `Offer_tourId_fkey` FOREIGN KEY (`tourId`) REFERENCES `Tour`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Destination` ADD CONSTRAINT `Destination_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierProfile` ADD CONSTRAINT `SupplierProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tour` ADD CONSTRAINT `Tour_departureDestinationId_fkey` FOREIGN KEY (`departureDestinationId`) REFERENCES `Destination`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tour` ADD CONSTRAINT `Tour_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `SupplierProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
