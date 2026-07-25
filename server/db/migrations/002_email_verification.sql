ALTER TABLE readers ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE readers ADD COLUMN verification_token TEXT;
ALTER TABLE readers ADD COLUMN reset_token TEXT;
ALTER TABLE readers ADD COLUMN reset_token_expires TEXT;