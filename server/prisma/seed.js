const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const existingUsers = await prisma.user.findMany();
  if (existingUsers.length > 0) {
    console.log('Users already seeded, skipping...');
    return;
  }

  const abdulHash = await bcrypt.hash('Vybrex@Abdul123', 12);
  const aminaHash = await bcrypt.hash('Vybrex@Amina123', 12);

  await prisma.user.create({
    data: {
      name: 'Abdul',
      email: 'abdul@vybrex.com',
      password_hash: abdulHash,
      role: 'owner',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Amina',
      email: 'amina@vybrex.com',
      password_hash: aminaHash,
      role: 'partner',
    },
  });

  await prisma.companySettings.create({
    data: {
      name: 'Vybrex Solutions',
      email: 'hello@vybrex.com',
      address: '',
      phone: '',
    },
  });

  console.log('Seeded: Abdul (owner) and Amina (partner)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
