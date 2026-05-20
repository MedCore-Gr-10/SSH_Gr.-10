/*
  Warnings:

  - Added the required column `slot_end_time` to the `appointments_booking_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slot_start_time` to the `appointments_booking_slots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments_booking_slots" ADD COLUMN     "slot_end_time" TIME(6) NOT NULL,
ADD COLUMN     "slot_start_time" TIME(6) NOT NULL;
