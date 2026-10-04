CREATE DATABASE IF NOT EXISTS tarot_modern CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tarot_modern;

CREATE TABLE IF NOT EXISTS tarot_readings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    topic VARCHAR(50) NOT NULL,
    cards JSON NOT NULL,
    overview TEXT NOT NULL,
    interpretations JSON NOT NULL,
    conclusion TEXT NOT NULL,
    visibility ENUM('private','unlisted','public') NOT NULL DEFAULT 'unlisted',
    session_id VARCHAR(128) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_public_id (public_id),
    INDEX idx_created_at (created_at),
    INDEX idx_session_id (session_id),
    INDEX idx_visibility (visibility),
    INDEX idx_topic (topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Snapshot kartu disimpan sebagai JSON agar hasil tidak berubah ketika deck/logic diperbarui.
-- Untuk backup:
-- mysqldump tarot_modern > backup.sql
