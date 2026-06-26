ALTER TABLE `ad_users`
  ADD COLUMN `sector` VARCHAR(255) NULL,
  ADD COLUMN `functional_id` VARCHAR(64) NULL,
  ADD COLUMN `cpf` VARCHAR(32) NULL,
  ADD COLUMN `role` VARCHAR(128) NULL,
  ADD COLUMN `personal_email` VARCHAR(255) NULL,
  ADD COLUMN `personal_phone` VARCHAR(64) NULL,
  ADD COLUMN `profile` VARCHAR(64) NULL;

CREATE INDEX `ad_users_cpf_idx` ON `ad_users`(`cpf`);
CREATE INDEX `ad_users_sector_idx` ON `ad_users`(`sector`);
CREATE INDEX `ad_users_profile_idx` ON `ad_users`(`profile`);
