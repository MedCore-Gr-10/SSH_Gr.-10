# MedCore — Dokumentimi i Projektit

**MedCore** është një platformë për menaxhimin e shëndetësisë që lidh pacientët me spitalet, mjekët dhe stafin mjekësor. Sistemi mbështet rezervimin e termineve, menaxhimin e stafit, historinë klinike (diagnoza, receta) dhe ndarjen e të dhënave sipas spitaleve (**multi-tenancy**).

Ky dokument përmbush kërkesën **13. Dokumentimi i Projektit**: arkitekturë, API dhe udhëzime instalimi/ekzekutimi.

---

## Përmbledhje

| Aspekti             | Përshkrim                                               |
| ------------------- | ------------------------------------------------------- |
| **Arkitekturë**     | Klient–server (React + Express), REST API               |
| **Backend**         | Node.js, Express 5, Prisma ORM, PostgreSQL              |
| **Frontend**        | React 19, Vite, React Router, Context API               |
| **Autentikim**      | JWT (Bearer), role-based access                         |
| **Cache**           | Redis (opsional, p.sh. lista e pacientëve të mjekut)    |
| **Dokumentim API**  | Swagger UI në `/api-docs`                               |
| **Detyra në sfond** | `node-cron` — gjenerim automatik i sloteve të termineve |

---

## Struktura e projektit

```
SSH_Gr.-10/
├── client/                 # Aplikacioni React (Vite)
│   ├── src/
│   │   ├── components/     # UI: layout, auth, tabela
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Faqe sipas rolit (patient, doctor, nurse, …)
│   │   └── services/       # Thirrje HTTP drejt API
│   └── vite.config.js      # Proxy /api → backend
│
└── server/                 # API REST
    ├── prisma/
    │   └── schema.prisma   # Modelet e databazës
    ├── scripts/            # Seed: superuser, director, nurse, staff
    └── src/
        ├── controllers/    # Shtresa HTTP (sipas rolit)
        ├── services/       # Logjika e biznesit
        ├── repositories/   # Akses në databazë (Prisma)
        ├── middlewares/    # Auth, role, hospital
        ├── routes/         # Definimi i endpoint-eve
        ├── utils/          # JWT, validime
        └── index.js        # Hyrja e serverit
```

---

## Arkitektura

### Paradigma klient–server

```
┌─────────────────┐     REST + JWT      ┌─────────────────┐
│  React (Vite)   │ ◄─────────────────► │  Express API    │
│  localhost:5173 │                     │  localhost:3000 │
└─────────────────┘                     └────────┬────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
             PostgreSQL                   Redis (ops.)              node-cron
             (Prisma ORM)                 cache                     slot generation
```

- Frontend dhe backend janë **të pavarur**; komunikimi bëhet vetëm përmes **API REST**.

### Shtresat e backend-it (OOP)

| Shtresë          | Përgjegjësi                   | Shembull                                 |
| ---------------- | ----------------------------- | ---------------------------------------- |
| **Routes**       | Mapim URL → controller        | `doctor.routes.js`                       |
| **Controllers**  | Validim request/response HTTP | `patients.controller.js`                 |
| **Services**     | Rregulla biznesi, orkestrim   | `appointments.service.js`                |
| **Repositories** | Query Prisma                  | `appointments-made.repository.js`        |
| **Middlewares**  | Auth, role, hospital context  | `authMiddleware.js`, `roleMiddleware.js` |

Klasa përdoren për middleware (`AuthMiddleware`, `RoleMiddleware`, `HospitalMiddleware`) dhe shërbime (`AuthService`, `RedisCacheService`).

### Multi-tenancy (spital)

- Spitalet ruhen në `hospitals`; lidhja spital–departament në `hospitals_departments`.
- Stafi lidhet me spital + departament në `staff_hospitals_departments`.
- Pacientët lidhen me spitale në `patients_hospitals`.
- **Director** dhe **nurse** kërkojnë `hospital_id` në JWT (`HospitalMiddleware`); aksesi në pacientë/staf filtrohet sipas tenancës së spitalit.
- **Superuser** menaxhon të gjithë sistemin pa kufizim spitali.

### Frontend

- **React Router** — rrugët publike (`/`, `/register`) dhe të mbrojtura (`/main/*`).
- **Context API** (`authContext`) — token JWT, roli, hospital_id.
- **Sidebar** dinamik sipas rolit (`Sidebar.jsx`).
- Shërbimet në `client/src/services/*` encapsulojnë fetch drejt API.

### Performancë dhe sfond

- **Redis**: cache për listën e pacientëve të mjekut (`RedisCacheService`, TTL nga `DOCTOR_PATIENTS_CACHE_TTL_SECONDS`).
- **Cron** (`cronJobs.service.js`): gjeneron slote javore për mjekët me template aktive (default: e hëna 00:00 UTC).

### Audit / logging

- Tabela `logs` regjistron veprime të ndjeshme (p.sh. infermieri/mjeku që lexon të dhëna pacienti me `reason` në query).

---

## Rolet dhe autorizimi

| Rol         | Përshkrim                                         | Prefix API kryesor                |
| ----------- | ------------------------------------------------- | --------------------------------- |
| `patient`   | Regjistrim, termine, profil, alergji, sigurim     | `/api/patient`                    |
| `doctor`    | Template/slote termine, pacientë, diagnoza/receta | `/api/doctor`                     |
| `nurse`     | Lexim i kufizuar pacientësh në spital, orare      | `/api/nurse`                      |
| `director`  | Staf, pacientë, departamente, termine në spital   | `/api/director`                   |
| `superuser` | Spitale, përdorues, departamente globale, logje   | `/api/hospitals`, `/api/users`, … |

**Autentikim:** header `Authorization: Bearer <token>` pas `POST /api/auth/login`.

**Middleware:**

1. `AuthMiddleware` — verifikon JWT, vendos `req.user`.
2. `RoleMiddleware` — lejon vetëm rolet e listuara për router-in.
3. `HospitalMiddleware` — për staff: kërkon `hospital_id` (përveç patient/superuser).

---

## Databaza (Prisma / PostgreSQL)

**Emri i databazës (dev):** `ssh`

### Modelet (23)

`allergies`, `appointments_booking_slots`, `appointments_made`, `appointments_templates`, `departments`, `diagnoses`, `emergency_contacts`, `hospitals`, `hospitals_departments`, `insurance`, `logs`, `patients_hospitals`, `prescriptions`, `profiles`, `requests`, `reviews`, `roles`, `specializations`, `staff_hospitals_departments`, `staff_specializations`, `staff_working_schedules`, `users`, `users_profiles`

### Marrëdhënie kryesore

- `users` ↔ `roles` — një përdorues, një rol.
- `users` ↔ `profiles` përmes `users_profiles` (email unik).
- Terminet: `appointments_templates` → `appointments_booking_slots` → `appointments_made` → `diagnoses` / `prescriptions`.
- Stafi: `staff_hospitals_departments` + `staff_working_schedules` + `staff_specializations`.

Migrimet: `npx prisma migrate dev` (nga `server/`).

---

## Dokumentimi i API

### Bazë

| Parametër  | Vlerë                            |
| ---------- | -------------------------------- |
| Base URL   | `http://localhost:3000`          |
| Format     | JSON                             |
| Auth       | `Authorization: Bearer <JWT>`    |
| Swagger UI | `http://localhost:3000/api-docs` |

Për endpoint-e me të dhëna sensitive (nurse/doctor), shpesh kërkohet query `reason=` për audit në `logs`.

---

### `/api/auth` — Autentikim

| Metoda | Rrugë             | Auth | Përshkrim                       |
| ------ | ----------------- | ---- | ------------------------------- |
| POST   | `/register`       | Jo   | Regjistrim pacienti (+ profil)  |
| POST   | `/login`          | Jo   | Hyrje; kthen JWT                |
| POST   | `/dev/mock-login` | Jo   | Vetëm `NODE_ENV !== production` |

---

### `/api/patient` — Pacient (rol: patient)

| Metoda                | Rrugë                                   | Përshkrim                          |
| --------------------- | --------------------------------------- | ---------------------------------- |
| GET                   | `/doctors`                              | Lista mjekësh për review           |
| GET/POST/DELETE       | `/reviews`, `/reviews/:reviewId`        | Vlerësime                          |
| GET                   | `/doctors/:doctorId/reviews`            | Review për mjek                    |
| GET/POST/PATCH/DELETE | `/emergency-contacts`                   | Kontakte urgjente                  |
| GET/POST/DELETE       | `/allergies`, `/allergies/:allergyId`   | Alergji                            |
| GET/POST/DELETE       | `/insurance`, `/insurance/:insuranceId` | Sigurim                            |
| GET/PUT               | `/hospitals`                            | Spitale të zgjedhura               |
| GET                   | `/appointments/filters`                 | Filtra kërkimi                     |
| GET                   | `/appointments/search`                  | Kërkim slote                       |
| GET                   | `/appointments/booked`                  | Termine të rezervuara              |
| GET                   | `/records`                              | Histori (vizita, diagnoza, receta) |
| GET                   | `/appointments/staff-schedules`         | Orare stafi                        |
| POST                  | `/appointments/:slotId/book`            | Rezervim                           |
| DELETE                | `/appointments/:appointmentId`          | Anulim                             |

---

### `/api/doctor` — Mjek (rol: doctor)

| Metoda              | Rrugë                                       | Përshkrim                             |
| ------------------- | ------------------------------------------- | ------------------------------------- |
| GET                 | `/patients`                                 | Pacientë të trajtuar (me cache Redis) |
| GET                 | `/patients/:id/history`                     | Histori (+ `reason`)                  |
| GET                 | `/patients/:id/allergies`                   | Alergji                               |
| GET                 | `/patients/:id/insurance`                   | Sigurim                               |
| GET                 | `/patients/:id/emergency-contacts`          | Kontakte                              |
| GET                 | `/patients/:id/appointments`                | Termine                               |
| GET                 | `/appointments/assignments`                 | Caktimet spital/departament           |
| GET/POST/PUT/DELETE | `/appointments/templates`                   | Template javore                       |
| GET                 | `/appointments/templates/summary`           | Përmbledhje                           |
| GET                 | `/appointments/templates/by-day/:day`       | Sipas ditës                           |
| GET                 | `/appointments/slots`                       | Slote                                 |
| GET                 | `/appointments/slots/available`             | Slote të lira (`?date=`)              |
| GET                 | `/appointments/slots/:id`                   | Slot i vetëm                          |
| GET                 | `/appointments/slots/generation/status`     | Status gjenerimi                      |
| POST                | `/appointments/slots/generate/week`         | Gjenerim javor manual                 |
| POST                | `/appointments/slots/generate/range`        | Gjenerim për interval                 |
| POST                | `/appointments/slots/generate/template/:id` | Gjenerim nga template                 |
| DELETE              | `/appointments/slots/:id`                   | Çaktivizim slot                       |
| PATCH               | `/appointments/:appointmentId/complete`     | Përfundim vizite                      |
| POST                | `/appointments/:appointmentId/record`       | Diagnozë + recetë                     |

---

### `/api/nurse` — Infermier/e (rol: nurse)

Qasje vetëm në tenancën e spitalit (`staff_hospitals_departments` + `patients_hospitals`). Lexim me `reason` ku kërkohet.

| Metoda | Rrugë                              | Përshkrim                        |
| ------ | ---------------------------------- | -------------------------------- |
| GET    | `/dashboard`                       | Statistika                       |
| GET    | `/schedules/me`                    | Orari im (`active_schedule`)     |
| GET    | `/schedules/staff`                 | Oraret e stafit                  |
| GET    | `/patients`                        | Lista pacientësh                 |
| GET    | `/patients/search`                 | Kërkim                           |
| GET    | `/patients/:id`                    | Detaje                           |
| GET    | `/patients/:id/allergies`          | Alergji                          |
| GET    | `/patients/:id/insurance`          | Sigurim                          |
| GET    | `/patients/:id/emergency-contacts` | Kontakte                         |
| GET    | `/patients/:id/appointments`       | Termine (`reason`)               |
| GET    | `/patients/:id/history`            | Histori (`reason`, `from`, `to`) |
| GET    | `/logs`                            | Logje të lexuara nga infermieri  |

---

### `/api/director` — Drejtor spitali (rol: director)

| Metoda              | Rrugë                                      | Përshkrim                     |
| ------------------- | ------------------------------------------ | ----------------------------- |
| GET/PUT/DELETE      | `/patients`, `/patients/:id`               | Menaxhim pacientësh           |
| GET/POST/PUT/DELETE | `/staff`, `/staff/:id`                     | Staf                          |
| GET/POST/PUT/DELETE | `/staff-schedules`, `/staff-schedules/:id` | Orare pune                    |
| GET                 | `/appointments`, `/appointments/slots`     | Termine                       |
| PUT/DELETE          | `/appointments/:id`                        | Përditësim / fshirje          |
| GET/POST/PUT/DELETE | `/appointments/templates`                  | Template terminesh            |
| GET/POST/PUT/DELETE | `/departments`, `/departments/:id`         | Departamente në spital        |
| GET                 | `/departments/catalog`                     | Katalog global departamentesh |
| GET                 | `/system-overview`                         | Përmbledhje spitali           |
| GET/POST            | `/requests`, `/requests/recipients`        | Kërkesa ndër-staf             |

---

### `/api/staff` — Staf (doctor, nurse, director)

| Metoda | Rrugë        | Përshkrim                |
| ------ | ------------ | ------------------------ |
| GET    | `/schedules` | Orare (kontekst spitali) |

---

### `/api/hospitals` — Spitale (superuser / menaxhim)

| Metoda | Rrugë   | Përshkrim      |
| ------ | ------- | -------------- |
| POST   | `/`     | Krijim spitali |
| GET    | `/`     | Lista          |
| GET    | `/ :id` | Sipas ID       |
| PUT    | `/ :id` | Përditësim     |
| DELETE | `/ :id` | Fshirje        |

---

### `/api/users` — Përdorues

| Metoda | Rrugë           | Përshkrim             |
| ------ | --------------- | --------------------- |
| GET    | `/`             | Të gjithë përdoruesit |
| GET    | `/:id`          | Sipas ID              |
| POST   | `/`             | Krijim                |
| PUT    | `/:id`          | Përditësim            |
| PUT    | `/:id/password` | Ndryshim fjalëkalimi  |

---

### `/api/profiles` — Profile

| Metoda              | Rrugë                    | Përshkrim                              |
| ------------------- | ------------------------ | -------------------------------------- |
| GET/PUT             | `/me`                    | Profili i përdoruesit të loguar (auth) |
| GET                 | `/personal/:personal_no` | Kërkim me numër personal               |
| GET                 | `/director/:personal_no` | Profil për drejtor                     |
| GET/POST/PUT/DELETE | `/`, `/:id`              | CRUD profile                           |

---

### `/api/departments` — Departamente (globale)

| Metoda         | Rrugë            | Përshkrim                       |
| -------------- | ---------------- | ------------------------------- |
| GET/POST       | `/`              | Lista / krijim                  |
| GET/PUT/DELETE | `/:id`           | CRUD                            |
| GET            | `/:id/hospitals` | Spitale që e kanë departamentin |
| GET            | `/:id/doctors`   | Mjekë në departament            |

---

### `/api/specializations` — Specializime

| Metoda     | Rrugë  | Përshkrim            |
| ---------- | ------ | -------------------- |
| GET/POST   | `/`    | Lista / krijim       |
| PUT/DELETE | `/:id` | Përditësim / fshirje |

---

### `/api/requests` — Kërkesa (staf)

| Metoda | Rrugë         | Përshkrim          |
| ------ | ------------- | ------------------ |
| GET    | `/recipients` | Marrës të mundshëm |
| GET    | `/`           | Lista kërkesave    |
| POST   | `/`           | Dërgim kërkese     |

---

### `/api/system-overview` & `/api/system-logs`

| Metoda | Rrugë                   | Përshkrim           |
| ------ | ----------------------- | ------------------- |
| GET    | `/api/system-overview/` | Përmbledhje sistemi |
| GET    | `/api/system-logs/`     | Logje sistemi       |

---

### `/api/appointments`

| Metoda | Rrugë                | Përshkrim                               |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/appointments-made` | Të gjitha terminet e kryera (superuser) |

---

## Frontend — rrugët kryesore

| Rrugë       | Qasja   | Përshkrim           |
| ----------- | ------- | ------------------- |
| `/`         | Publike | Login               |
| `/register` | Publike | Regjistrim pacienti |
| `/main/*`   | JWT     | Zona e aplikacionit |

Pas login, përdoruesi ridrejtohet në `/main/dashboard` (ose faqe sipas rolit). Sidebar shfaq menu të ndryshme për: `superuser`, `director`, `patient`, `doctor`, `nurse`.

Shembuj rrugësh:

- Superuser: `/main/hospitals`, `/main/users`, `/main/system-logs`
- Pacient: `/main/appointments`, `/main/my-appointments`, `/main/records`
- Mjek: `/main/appointments-schedule`, `/main/patients`
- Infermier: `/main/nurse/schedule`, `/main/nurse/patients`

---

## Udhëzime instalimi dhe ekzekutimi

### Kërkesat

- **Node.js** (LTS)
- **PostgreSQL**
- **Redis** (opsional por i rekomanduar për cache; në Windows përmes **WSL**)
- **npm**

### 1. Instalimi i varësive

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Databaza PostgreSQL

1. Krijoni databazën **`ssh`** (e zbrazët).
2. Krijoni `server/.env` (nëse mungon):

```env
DATABASE_URL="postgresql://postgres:FJALEKALIMI@localhost:5432/ssh"
JWT_SECRET="your-secret-key-at-least-32-chars"
NODE_ENV=development
```

Zëvendësoni `FJALEKALIMI` me fjalëkalimin tuaj PostgreSQL.

### 3. Migrimet Prisma

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Redis (Windows + WSL)

Redis nuk mbështetet nativ në Windows; përdorni WSL:

```powershell
wsl --install
wsl --install -d Ubuntu
```

Në Ubuntu (WSL):

```bash
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping
```

Shtoni në `server/.env`:

```env
REDIS_URL=redis://127.0.0.1:6379
DOCTOR_PATIENTS_CACHE_TTL_SECONDS=900
```

Pas çdo restart të PC-së: `sudo service redis-server start` në WSL.

### 5. Nisja e serverit

````bash
cd server
cd src
node src/index.js

Serveri dëgjon në **portin 3000**.

### 6. Nisja e klientit

```bash
cd client
npm run dev
````

Aplikacioni hapet zakonisht në **http://localhost:5173**.

### 7. Përdorues test (skripte)

```bash
cd server
npm run create-superuser
npm run create-director
npm run create-staff
```

Pacientët regjistrohen nga UI: **`/register`**.

### 8. Swagger

Pas nisjes së serverit:

**http://localhost:3000/api-docs**

Varësitë `swagger-ui-express` dhe `swagger-jsdoc` janë në `server/package.json`.

---

## Variablat e mjedisit (`server/.env`)

| Variabël                            | Detyrueshmëria                      |
| ----------------------------------- | ----------------------------------- |
| `DATABASE_URL`                      | Lidhja PostgreSQL                   |
| `JWT_SECRET`                        | Sekret për JWT (min. ~32 karaktere) |
| `NODE_ENV`                          | `development` / `production`        |
| `REDIS_URL`                         | Lidhja Redis (opsional)             |
| `DOCTOR_PATIENTS_CACHE_TTL_SECONDS` | TTL cache pacientë mjek (sekonda)   |

---

## Siguria (përmbledhje)

- Fjalëkalimet hash-ohen me **bcrypt** (`hash_password`, `salt` në `users`).
- **JWT** me skadencë; dërgohet si Bearer token.
- **RBAC** në çdo router me role specifike.
- **Hospital scoping** për stafin klinik.
- **Audit logs** për akses të dhënash pacienti me arsye (`reason`).

---

## Shërbimet e platformës

### Për pacientët

- Zgjedhje spitalesh, kërkim dhe rezervim terminesh
- Menaxhim alergjish, sigurimi, kontakteve urgjente
- Histori vizitash, diagnozash dhe recetash
- Vlerësim mjekësh (reviews)

### Për spitalet / stafin

- Menaxhim stafi, orareve dhe departamenteve (drejtor)
- Template dhe slote terminesh (mjek)
- Mbikëqyrje terminesh dhe pacientësh në spital
- Kërkesa ndër-përdorues (`requests`)

### Për superuser

- CRUD spitale, përdorues, departamente globale, specializime
- Pamje sistemi dhe logje

---

## Vizioni

Të bëhemi infrastrukturë digjitale për menaxhimin e shëndetësisë: **transparent**, **efikas** dhe **i besueshëm** për profesionistët dhe pacientët.

---
