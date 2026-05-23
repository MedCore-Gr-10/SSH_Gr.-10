ALTER TABLE "emergency_contacts"
RENAME COLUMN "contact_name" TO "first_name";

ALTER TABLE "emergency_contacts"
ADD COLUMN "last_name" VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN "email" TEXT,
ADD COLUMN "id_number" VARCHAR(50);

UPDATE "emergency_contacts"
SET "phone_number" = 'missing-' || "id"::text
WHERE "phone_number" IS NULL OR trim("phone_number") = '';

ALTER TABLE "emergency_contacts"
ALTER COLUMN "phone_number" SET NOT NULL;

ALTER TABLE "profiles"
ADD COLUMN "current_emergency_contact_id" UUID;

ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_current_emergency_contact_id_fkey"
FOREIGN KEY ("current_emergency_contact_id")
REFERENCES "emergency_contacts"("id")
ON DELETE SET NULL
ON UPDATE NO ACTION;
