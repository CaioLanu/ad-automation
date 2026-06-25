-- CreateTable
CREATE TABLE `sei_import_batches` (
    `id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `total_rows` INTEGER NOT NULL,
    `imported_rows` INTEGER NOT NULL,
    `invalid_rows` INTEGER NOT NULL,
    `actor_user_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sei_import_batches_actor_user_id_idx`(`actor_user_id`),
    INDEX `sei_import_batches_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sei_tasks` (
    `id` CHAR(36) NOT NULL,
    `batch_id` CHAR(36) NULL,
    `sector` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `rg_login` VARCHAR(64) NOT NULL,
    `functional_id` VARCHAR(64) NULL,
    `cpf` VARCHAR(32) NULL,
    `role` VARCHAR(128) NULL,
    `personal_email` VARCHAR(255) NULL,
    `personal_phone` VARCHAR(64) NULL,
    `profile` VARCHAR(64) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE') NOT NULL DEFAULT 'CREATE',
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'INVALID') NOT NULL DEFAULT 'PENDING',
    `validation_errors` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sei_tasks_name_idx`(`name`),
    INDEX `sei_tasks_rg_login_idx`(`rg_login`),
    INDEX `sei_tasks_cpf_idx`(`cpf`),
    INDEX `sei_tasks_status_idx`(`status`),
    INDEX `sei_tasks_action_idx`(`action`),
    INDEX `sei_tasks_sector_idx`(`sector`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sei_import_batches` ADD CONSTRAINT `sei_import_batches_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `system_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sei_tasks` ADD CONSTRAINT `sei_tasks_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `sei_import_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
