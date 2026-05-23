UPDATE "allergies"
SET "allergy_name" = 'Unknown allergy ' || "id"::text
WHERE "allergy_name" IS NULL OR trim("allergy_name") = '';

ALTER TABLE "allergies"
ALTER COLUMN "allergy_name" SET NOT NULL;

ALTER TABLE "allergies"
ADD COLUMN "allergy_type" VARCHAR(50) NOT NULL DEFAULT 'Other',
ADD COLUMN "reaction_symptoms" TEXT NOT NULL DEFAULT '',
ADD COLUMN "severity" VARCHAR(50) NOT NULL DEFAULT 'Mild';
