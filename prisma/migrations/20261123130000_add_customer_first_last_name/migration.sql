ALTER TABLE "User"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

-- Preserve all existing accounts. Populate a best-effort name split for display;
-- customers can provide accurate separate names when they register or update details.
UPDATE "User"
SET
  "firstName" = NULLIF(split_part(btrim("fullName"), ' ', 1), ''),
  "lastName" = NULLIF(regexp_replace(btrim("fullName"), '^[^ ]+[ ]*', ''), '')
WHERE "fullName" IS NOT NULL
  AND btrim("fullName") <> '';
