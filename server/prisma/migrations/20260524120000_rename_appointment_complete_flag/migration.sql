ALTER TABLE "appointments_made"
RENAME COLUMN "active_appointment_made" TO "appointment_is_complete";

ALTER TABLE "appointments_made"
ALTER COLUMN "appointment_is_complete" SET DEFAULT false;

UPDATE "appointments_made"
SET "appointment_is_complete" = false;
