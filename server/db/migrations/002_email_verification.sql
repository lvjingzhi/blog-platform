ALTER TABLE readers ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE readers ADD COLUMN verification_token TEXT;
ALTER TABLE readers ADD COLUMN reset_token TEXT;
ALTER TABLE readers ADD COLUMN reset_token_expires TEXT;

-- 现有用户直接标记为已验证（不需要重新验证）
UPDATE readers SET email_verified = 1 WHERE email_verified = 0 AND verification_token IS NULL;