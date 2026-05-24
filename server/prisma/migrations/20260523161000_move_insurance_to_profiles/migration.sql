ALTER TABLE "insurance"
ADD COLUMN "profile_id" UUID,
ADD COLUMN "insurance_company_email" TEXT,
ADD COLUMN "customer_support_number" TEXT;

UPDATE "insurance" i
SET "profile_id" = up."profile_id"
FROM "users_profiles" up
WHERE i."patient_id" = up."user_id";

DELETE FROM "insurance"
WHERE "profile_id" IS NULL;

ALTER TABLE "insurance"
ALTER COLUMN "profile_id" SET NOT NULL;

ALTER TABLE "insurance"
DROP CONSTRAINT IF EXISTS "insurance_patient_id_fkey";

ALTER TABLE "insurance"
DROP COLUMN IF EXISTS "patient_id";

ALTER TABLE "insurance"
ADD CONSTRAINT "insurance_profile_id_fkey"
FOREIGN KEY ("profile_id")
REFERENCES "profiles"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;
