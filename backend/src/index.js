import prisma from './prisma.js';

async function createone() {
  const users = await prisma.users.create({
    data: {
      email: "test@exampleeee.com",
    },
  });

  console.log(users);
  console.log("Done!");
  console.log("Done!");

}

async function readall() {
    const users = await prisma.users.findMany();
  console.log(users);
}

readall();
  console.log("Done!");
