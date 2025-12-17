-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `agencyMarkupAmount` DOUBLE NULL,
    ADD COLUMN `agencyPricingMode` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `agencyProLinkId` VARCHAR(191) NULL,
    ADD COLUMN `payment_brand` VARCHAR(191) NULL,
    ADD COLUMN `payment_last4` VARCHAR(191) NULL,
    ADD COLUMN `payment_method` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `AgencyProLink` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `tourId` VARCHAR(191) NOT NULL,
    `agencyUserId` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `basePrice` DOUBLE NOT NULL,
    `markup` DOUBLE NOT NULL,
    `note` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AgencyProLink_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerPayment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL,
    `last4` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CustomerPayment_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_agencyProLinkId_fkey` FOREIGN KEY (`agencyProLinkId`) REFERENCES `AgencyProLink`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgencyProLink` ADD CONSTRAINT `AgencyProLink_tourId_fkey` FOREIGN KEY (`tourId`) REFERENCES `Tour`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgencyProLink` ADD CONSTRAINT `AgencyProLink_agencyUserId_fkey` FOREIGN KEY (`agencyUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerPayment` ADD CONSTRAINT `CustomerPayment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
