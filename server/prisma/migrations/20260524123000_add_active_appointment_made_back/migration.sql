ALTER TABLE "appointments_made"
ADD COLUMN IF NOT EXISTS "active_appointment_made" BOOLEAN DEFAULT true;

UPDATE "appointments_made"
SET "active_appointment_made" = true
WHERE "active_appointment_made" IS NULL;

ALTER TABLE "appointments_made"
ALTER COLUMN "appointment_is_complete" SET DEFAULT false;
