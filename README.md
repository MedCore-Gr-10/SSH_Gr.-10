per te instaluer modulet
    cd server
    •   npm install
    cd client
    •   npm install

Shiko per nje file .env ( nese nuk eshte gjeneruar , shtoje) FileName =  .env
1. Fillimisht krijoni nje databaze ----------TE ZBRAZET------ tek postgreSQL me emrin "ssh"
2. tek file server/.env rregulloni user , password-in dhe portin sipas posgreSQL tuaj
    DATABASE_URL="postgresql://postgres:123@localhost:5432/ssh"
    JWT_SECRET="your-secret-key-at-least-32-chars"
    123- ky eshte passwordi im ( vendose passin tend)
3. permes command prompt shko tek server dhe beje run (rregullimi i prisma)
    •	cd server
    •   npx prisma migrate dev
    •	npx prisma generate
4. per te ekzekutuar serverin 
    •	cd src
    •	node index.js
5. per te ekzekutuar client
    •	cd client
    •	npm run dev

6. ne .env file (qe gjendet brenda gitignore) --> DATABASE_URL="secili setup-in e vet te nderlidhjes me databaze"
JWT_SECRET=your-super-secret-key-min-32-chars-recommended
NODE_ENV=development
7. Per krijimin e superuser initially, run this ne terminal:
cd server
npm run create-superuser
-->ne browser login me kredencialet: 
Username: superuser
Password: superuser123
8. Per krijimin e director (meqe ne superuser nuk eshte funksionale yet), run this ne terminal:
cd server
npm run create-director
-->ne browser login me kredencialet:
Username: dev_director
Password: devdirector123


---
# 🏥 MedCore

**MedCore** është një platformë gjithëpërfshirëse për menaxhimin e shëndetësisë, e krijuar për të lidhur pacientët me ofruesit e shërbimeve mjekësore. Qëllimi ynë është të thjeshtojmë procesin e rezervimit të termineve dhe ta bëjmë kujdesin shëndetësor më të aksesueshëm për të gjithë.

---

# Shërbimet tona

### 👤 Për pacientët
- Shfletoni një listë të kuruar të spitaleve dhe qendrave mjekësore më të vlerësuara  
- Zgjidhni specialistin e duhur sipas nevojës suaj  
- Rezervoni termine shpejt dhe lehtë, me vetëm disa klikime  

### 🏥 Për spitalet
- Menaxhoni oraret e mjekëve dhe stafit  
- Organizoni dhe monitoroni rezervimet e pacientëve  
- Përdorni një dashboard të integruar për administrim efikas  

---

## ⭐ Pse MedCore?

Ne besojmë se rezervimi i një vizite mjekësore nuk duhet të jetë stresues.  
Duke centralizuar:
- listën e spitaleve  
- disponueshmërinë në kohë reale  

MedCore ju ndihmon të kaloni më pak kohë duke pritur dhe më shumë kohë duke marrë kujdesin që meritoni.

---

## 🌍 Vizioni ynë

Të bëhemi baza digjitale e industrisë së shëndetësisë, duke krijuar një ambient:
- transparent  
- efikas  
- të besueshëm  

për profesionistët mjekësorë dhe komunitetet që ata shërbejnë.

---

## ⚙️ Arkitektura & Specifikimet Teknike

### 🧩 Arkitektura
- Sistem i ndërtuar mbi **arkitekturë klient-server**, ku frontend dhe backend janë të pavarur  
- Komunikimi realizohet vetëm përmes **API-ve REST**
- Implementim sipas paradigmës **OOP (Object-Oriented Programming)**
- **Multi-Tenancy** për ndarjen e të dhënave sipas spitaleve
- Ndërtuar me **React**
- Menaxhim i state me **Context API** 

### 🔗 API & Backend
-  **20 endpoint-e të strukturuara mirë**
- Ndërtuar me framework modern si:
  - Node.js
- Dokumentim i plotë me **Swagger UI**

### 🗄️ Databaza & ORM
- Përdorimi i Prisma si **ORM** për ndërveprim me databazën  
- Mbi **20 modele**
- Mbështetje për **migrime**

### 🔐 Siguria
- Sistem i plotë **autentikimi (login/register)** përmes `POST /api/auth/login` dhe `POST /api/auth/register` (regjistrim vetëm për pacientë)
- Frontend: `/` (login), `/register`, pas hyrjes `/main/dashboard` me sidebar sipas rolit
- **Role-based authorization** (p.sh. pacient, superuser, doctor, nurse, director)  
- Middleware për:
  - autentikim  
  - logging  

### 🧪 Testimi & DevOps
- Implementim i:
  - unit testeve  
  - API testeve  
- Integrim me **CI/CD pipelines**

### 🤖 Integrimi AI
- Modul i integruar me **OpenAI API**
- Endpoint-e për:
  - chatbot  
  - analiza teksti  

### ⚡ Performanca
- Implementim i **caching** (p.sh. Redis)  
- Përmirësim i performancës për kërkesa të shpeshta  

### 🔄 Background Jobs
- Detyra asinkrone si:
  - dërgimi i email-eve  
  - përpunimi i të dhënave  
  - thirrje ndaj API-ve të jashtme   

### 📊 Menaxhimi i Projektit
- Përdorimi i Jira  
- Versionim me **Git**
- Përdorimi i:
  - Pull Requests  
  - Code Reviews  