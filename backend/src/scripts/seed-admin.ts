import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../infrastructure/prisma/client.js';

const seedAdminSchema = z.object({
  ADMIN_RG: z.string().trim().min(1),
  ADMIN_PASSWORD: z.string().min(12),
  ADMIN_NAME: z.string().trim().min(1).max(255),
});

async function main() {
  const env = seedAdminSchema.parse(process.env);
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  await prisma.systemUser.upsert({
    where: { rg: env.ADMIN_RG },
    update: {
      name: env.ADMIN_NAME,
      passwordHash,
      permission: 'ADMINISTRATORS',
      isActive: true,
    },
    create: {
      rg: env.ADMIN_RG,
      name: env.ADMIN_NAME,
      passwordHash,
      permission: 'ADMINISTRATORS',
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : 'Seed admin failed');
    await prisma.$disconnect();
    process.exit(1);
  });
