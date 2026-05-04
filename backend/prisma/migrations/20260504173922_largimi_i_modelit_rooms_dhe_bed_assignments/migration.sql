/*
  Warnings:

  - You are about to drop the `bed_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bed_assignments" DROP CONSTRAINT "bed_assignments_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "bed_assignments" DROP CONSTRAINT "bed_assignments_room_id_fkey";

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_department_id_fkey";

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_hospital_id_fkey";

-- DropTable
DROP TABLE "bed_assignments";

-- DropTable
DROP TABLE "rooms";
