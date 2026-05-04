-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" SERIAL NOT NULL,
    "patient_id" UUID,
    "allergy_name" VARCHAR(50),

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments_booking_slots" (
    "id" SERIAL NOT NULL,
    "doctor_id" UUID,
    "appointment_template_id" INTEGER,
    "appointment_date" DATE NOT NULL,
    "active_appointment_booking_slot" BOOLEAN DEFAULT true,

    CONSTRAINT "appointments_booking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments_made" (
    "id" SERIAL NOT NULL,
    "appointment_booking_slot_id" INTEGER,
    "patient_id" UUID,
    "active_appointment_made" BOOLEAN DEFAULT true,

    CONSTRAINT "appointments_made_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments_templates" (
    "id" SERIAL NOT NULL,
    "staff_id" UUID,
    "hospital_id" INTEGER,
    "department_id" INTEGER,
    "day_of_week" VARCHAR(10),
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "active_appointment_template" BOOLEAN DEFAULT true,

    CONSTRAINT "appointments_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bed_assignments" (
    "id" SERIAL NOT NULL,
    "patient_id" UUID,
    "room_id" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bed_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "department_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" SERIAL NOT NULL,
    "appointment_made_id" INTEGER,
    "diagnosis" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID,
    "contact_name" VARCHAR(100) NOT NULL,
    "relationship" VARCHAR(50),
    "phone_number" TEXT,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" SERIAL NOT NULL,
    "hospital_name" VARCHAR(50),
    "hospital_address" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals_departments" (
    "hospital_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "hospitals_departments_pkey" PRIMARY KEY ("hospital_id","department_id")
);

-- CreateTable
CREATE TABLE "insurance" (
    "id" SERIAL NOT NULL,
    "patient_id" UUID,
    "provider" TEXT,
    "policy_number" TEXT,
    "coverage_percent" INTEGER,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients_hospitals" (
    "patient_id" UUID NOT NULL,
    "hospital_id" INTEGER NOT NULL,

    CONSTRAINT "patients_hospitals_pkey" PRIMARY KEY ("patient_id","hospital_id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" SERIAL NOT NULL,
    "appointment_made_id" INTEGER,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT,
    "instructions" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(50),
    "last_surname" VARCHAR(50),
    "birth" DATE,
    "gender" TEXT,
    "personal_no" TEXT,
    "phone_number" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "patient_id" UUID,
    "doctor_id" UUID,
    "rating" INTEGER,
    "comment" TEXT,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "hospital_id" INTEGER,
    "department_id" INTEGER,
    "room_number" VARCHAR(20) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" SERIAL NOT NULL,
    "specialization_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_hospitals_departments" (
    "staff_id" UUID NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "staff_hospitals_departments_pkey" PRIMARY KEY ("staff_id","hospital_id","department_id")
);

-- CreateTable
CREATE TABLE "staff_specializations" (
    "staff_id" UUID NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "specialization_id" INTEGER NOT NULL,

    CONSTRAINT "staff_specializations_pkey" PRIMARY KEY ("staff_id","hospital_id","department_id","specialization_id")
);

-- CreateTable
CREATE TABLE "staff_working_schedules" (
    "id" SERIAL NOT NULL,
    "staff_id" UUID,
    "hospital_id" INTEGER,
    "department_id" INTEGER,
    "day_of_week" VARCHAR(10),
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active_schedule" BOOLEAN DEFAULT true,

    CONSTRAINT "staff_working_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) NOT NULL,
    "hash_password" TEXT NOT NULL,
    "salt" TEXT,
    "role_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_profiles" (
    "user_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_profiles_pkey" PRIMARY KEY ("user_id","profile_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "allergies_patient_id_allergy_name_key" ON "allergies"("patient_id", "allergy_name");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_templates_staff_id_hospital_id_department_id_d_key" ON "appointments_templates"("staff_id", "hospital_id", "department_id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "departments_department_name_key" ON "departments"("department_name");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_patient_id_phone_number_key" ON "emergency_contacts"("patient_id", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_email_key" ON "hospitals"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_hospital_name_hospital_address_key" ON "hospitals"("hospital_name", "hospital_address");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_personal_no_key" ON "profiles"("personal_no");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_patient_id_doctor_id_key" ON "reviews"("patient_id", "doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_hospital_id_department_id_room_number_key" ON "rooms"("hospital_id", "department_id", "room_number");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_specialization_name_key" ON "specializations"("specialization_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_profiles_email_key" ON "users_profiles"("email");

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments_booking_slots" ADD CONSTRAINT "appointments_booking_slots_appointment_template_id_fkey" FOREIGN KEY ("appointment_template_id") REFERENCES "appointments_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments_booking_slots" ADD CONSTRAINT "appointments_booking_slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments_made" ADD CONSTRAINT "appointments_made_appointment_booking_slot_id_fkey" FOREIGN KEY ("appointment_booking_slot_id") REFERENCES "appointments_booking_slots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments_made" ADD CONSTRAINT "appointments_made_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments_templates" ADD CONSTRAINT "appointments_templates_staff_id_hospital_id_department_id_fkey" FOREIGN KEY ("staff_id", "hospital_id", "department_id") REFERENCES "staff_hospitals_departments"("staff_id", "hospital_id", "department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bed_assignments" ADD CONSTRAINT "bed_assignments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bed_assignments" ADD CONSTRAINT "bed_assignments_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_appointment_made_id_fkey" FOREIGN KEY ("appointment_made_id") REFERENCES "appointments_made"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hospitals_departments" ADD CONSTRAINT "hospitals_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hospitals_departments" ADD CONSTRAINT "hospitals_departments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patients_hospitals" ADD CONSTRAINT "patients_hospitals_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patients_hospitals" ADD CONSTRAINT "patients_hospitals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_made_id_fkey" FOREIGN KEY ("appointment_made_id") REFERENCES "appointments_made"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_hospitals_departments" ADD CONSTRAINT "staff_hospitals_departments_hospital_id_department_id_fkey" FOREIGN KEY ("hospital_id", "department_id") REFERENCES "hospitals_departments"("hospital_id", "department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_hospitals_departments" ADD CONSTRAINT "staff_hospitals_departments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_specializations" ADD CONSTRAINT "staff_specializations_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_specializations" ADD CONSTRAINT "staff_specializations_staff_id_hospital_id_department_id_fkey" FOREIGN KEY ("staff_id", "hospital_id", "department_id") REFERENCES "staff_hospitals_departments"("staff_id", "hospital_id", "department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_working_schedules" ADD CONSTRAINT "staff_working_schedules_staff_id_hospital_id_department_id_fkey" FOREIGN KEY ("staff_id", "hospital_id", "department_id") REFERENCES "staff_hospitals_departments"("staff_id", "hospital_id", "department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
