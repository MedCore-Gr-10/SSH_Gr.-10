ALTER TABLE "allergies"
ADD COLUMN "profile_id" UUID;

UPDATE "allergies" a
SET "profile_id" = up."profile_id"
FROM "users_profiles" up
WHERE a."patient_id" = up."user_id";

DELETE FROM "allergies"
WHERE "profile_id" IS NULL;

ALTER TABLE "allergies"
ALTER COLUMN "profile_id" SET NOT NULL;

DROP INDEX IF EXISTS "allergies_patient_id_allergy_name_key";

CREATE UNIQUE INDEX "allergies_profile_id_allergy_name_key"
ON "allergies"("profile_id", "allergy_name");

ALTER TABLE "allergies"
ADD CONSTRAINT "allergies_profile_id_fkey"
FOREIGN KEY ("profile_id")
REFERENCES "profiles"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "emergency_contacts"
ADD COLUMN "profile_id" UUID;

UPDATE "emergency_contacts" ec
SET "profile_id" = up."profile_id"
FROM "users_profiles" up
WHERE ec."patient_id" = up."user_id";

DELETE FROM "emergency_contacts"
WHERE "profile_id" IS NULL;

ALTER TABLE "emergency_contacts"
ALTER COLUMN "profile_id" SET NOT NULL;

DROP INDEX IF EXISTS "emergency_contacts_patient_id_phone_number_key";

CREATE UNIQUE INDEX "emergency_contacts_profile_id_phone_number_key"
ON "emergency_contacts"("profile_id", "phone_number");

ALTER TABLE "emergency_contacts"
ADD CONSTRAINT "emergency_contacts_profile_id_fkey"
FOREIGN KEY ("profile_id")
REFERENCES "profiles"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;
