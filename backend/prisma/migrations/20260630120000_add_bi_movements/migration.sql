CREATE TABLE `bi_movements` (
  `id` CHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `kind` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `functional_id` VARCHAR(64) NOT NULL,
  `sector` VARCHAR(255) NOT NULL,
  `role` VARCHAR(128) NOT NULL,
  `symbol` VARCHAR(32) NOT NULL,
  `source_file` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `bi_movements_date_idx` (`date`),
  INDEX `bi_movements_kind_idx` (`kind`),
  INDEX `bi_movements_functional_id_idx` (`functional_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
