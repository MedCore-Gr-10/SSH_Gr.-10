per te instaluer modulet
    cd server
    •   npm install
    cd client
    •   npm install

Shiko per nje file .env ( nese nuk eshte gjeneruar , shotje) FileName =  .env
1. Fillimisht krijoni nje databaze te zbrazet tek postgreSQL me emrin "ssh"
2. Tek folderi SQL keni komandat ne sql per krijimin e databazes, beje run ne postgreSQL
3. tek file backend/.env rregulloni user , password-in dhe portin sipas posgreSQL tuaj
    DATABASE_URL="postgresql://postgres:123@localhost:5432/ssh"
    123- ky eshte passwordi im ( vendose passin tend)
4. permes command prompt shko tek backend dhe beje run 
    •	npx prisma db pull
    •   npx prisma migrate dev
    •	npx prisma generate

