per te instaluer modulet
    cd server
    •   npm install
    cd client
    •   npm install

Shiko per nje file .env ( nese nuk eshte gjeneruar , shtoje) FileName =  .env
1. Fillimisht krijoni nje databaze ----------TE ZBRAZET------ tek postgreSQL me emrin "ssh"
2. tek file backend/.env rregulloni user , password-in dhe portin sipas posgreSQL tuaj
    DATABASE_URL="postgresql://postgres:123@localhost:5432/ssh"
    123- ky eshte passwordi im ( vendose passin tend)
3. permes command prompt shko tek backend dhe beje run (rregullimi i prisma)
    •	cd backend
    •   npx prisma migrate dev
    •	npx prisma generate
4. per te ekzekutuar serverin 
    •	cd src
    •	node index.js
5. per te ekzekutuar client
    •	cd client
    •	npm run dev
