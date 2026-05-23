ALTER TABLE "allergies"
DROP CONSTRAINT IF EXISTS "allergies_patient_id_fkey";

ALTER TABLE "allergies"
DROP COLUMN IF EXISTS "patient_id";

ALTER TABLE "emergency_contacts"
DROP CONSTRAINT IF EXISTS "emergency_contacts_patient_id_fkey";

ALTER TABLE "emergency_contacts"
DROP COLUMN IF EXISTS "patient_id";
