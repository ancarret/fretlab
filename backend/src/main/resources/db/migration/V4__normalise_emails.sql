-- Emails are now stored lowercase (see AuthController.normalize); fold any existing accounts so
-- they can still sign in. The UNIQUE constraint makes this fail loudly, not silently merge, if two
-- accounts ever differed only by case.
UPDATE users SET email = lower(trim(email));
