CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (role_name)
VALUES ('superuser'),('director'),('patient'),('doctor'),('nurse'),('janitor');

CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    hash_password TEXT NOT NULL,
    salt TEXT,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE profiles(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50),
    last_surname VARCHAR(50),
    birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female')),
    personal_no TEXT UNIQUE CHECK (personal_no ~ '^[0-9]{10}$'),
    phone_number TEXT CHECK (phone_number ~ '^\+[1-9][0-9]{7,14}$')
);

CREATE TABLE users_profiles(
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL CHECK (email = LOWER(email)),
    PRIMARY KEY (user_id, profile_id)
);

CREATE TABLE emergency_contacts(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    phone_number TEXT CHECK (phone_number ~ '^\+[1-9][0-9]{7,14}$'),
    UNIQUE (patient_id, phone_number)
);

CREATE TABLE hospitals(
    id SERIAL PRIMARY KEY,
    hospital_name VARCHAR(50),
    hospital_address TEXT,
    email TEXT UNIQUE NOT NULL CHECK (email = LOWER(email)),
    UNIQUE(hospital_name, hospital_address)
);

CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE hospitals_departments(
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    PRIMARY KEY(hospital_id, department_id)
);

CREATE TABLE patients_hospitals(
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    PRIMARY KEY(patient_id, hospital_id)
);

CREATE TABLE staff_hospitals_departments(
    staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id INTEGER,
    department_id INTEGER,
    PRIMARY KEY(staff_id, hospital_id, department_id),
    FOREIGN KEY (hospital_id, department_id) 
        REFERENCES hospitals_departments(hospital_id, department_id) 
        ON DELETE CASCADE
);

CREATE TABLE specializations(
    id SERIAL PRIMARY KEY,
    specialization_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE staff_specializations(
    staff_id UUID,
    hospital_id INTEGER,
    department_id INTEGER,
    specialization_id INTEGER REFERENCES specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, hospital_id, department_id, specialization_id),
    FOREIGN KEY (staff_id, hospital_id, department_id)
        REFERENCES staff_hospitals_departments(staff_id, hospital_id, department_id)
        ON DELETE CASCADE
);

CREATE TABLE allergies(
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    allergy_name VARCHAR(50),
    UNIQUE (patient_id, allergy_name)
);

CREATE TABLE insurance(
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT,
    policy_number TEXT,
    coverage_percent INTEGER,
    start_date DATE,
    end_date DATE
);

CREATE TABLE staff_working_schedules(
    id SERIAL PRIMARY KEY,
    staff_id UUID,
    hospital_id INTEGER,
    department_id INTEGER,
    day_of_week VARCHAR(10) CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_schedule BOOLEAN DEFAULT true,
    FOREIGN KEY (staff_id, hospital_id, department_id)
        REFERENCES staff_hospitals_departments(staff_id, hospital_id, department_id)
        ON DELETE CASCADE
);

CREATE TABLE appointments_templates(
    id SERIAL PRIMARY KEY,
    staff_id UUID,
    hospital_id INTEGER,
    department_id INTEGER,
    day_of_week VARCHAR(10) CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active_appointment_template BOOLEAN DEFAULT true,
    UNIQUE(staff_id, hospital_id, department_id, day_of_week, start_time),
    FOREIGN KEY (staff_id, hospital_id, department_id)
        REFERENCES staff_hospitals_departments(staff_id, hospital_id, department_id)
        ON DELETE CASCADE
);

CREATE TABLE appointments_booking_slots(
    id SERIAL PRIMARY KEY,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_template_id INTEGER REFERENCES appointments_templates(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    active_appointment_booking_slot BOOLEAN DEFAULT true
);

CREATE TABLE appointments_made(
    id SERIAL PRIMARY KEY,
    appointment_booking_slot_id INTEGER REFERENCES appointments_booking_slots(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    active_appointment_made BOOLEAN DEFAULT true
);

CREATE TABLE diagnoses(
    id SERIAL PRIMARY KEY,
    appointment_made_id INTEGER REFERENCES appointments_made(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions(
    id SERIAL PRIMARY KEY,
    appointment_made_id INTEGER REFERENCES appointments_made(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms(
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    UNIQUE(hospital_id, department_id, room_number)
);

CREATE TABLE bed_assignments(
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    UNIQUE(patient_id, doctor_id)
);