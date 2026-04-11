import prisma from './prisma.js';

async function createone() {
  const user = await prisma.user.create({
    data: {
      email: "test@exampleeee.com",
    },
  });

  console.log(user);
  console.log("Done!");
  console.log("Done!");

}

async function readall() {
    const users = await prisma.user.findMany();
  console.log(users);
}

readall();
  console.log("Done!");
