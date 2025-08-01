-- Script to make a user an admin
-- Replace 'your-email@example.com' with your actual email address

UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT id, email, role FROM "User" WHERE role = 'admin';