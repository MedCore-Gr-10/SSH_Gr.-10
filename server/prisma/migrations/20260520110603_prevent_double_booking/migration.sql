/*
  Warnings:

  - A unique constraint covering the columns `[appointment_booking_slot_id]` on the table `appointments_made` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "appointments_made_appointment_booking_slot_id_key" ON "appointments_made"("appointment_booking_slot_id");
