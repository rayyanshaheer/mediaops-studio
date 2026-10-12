import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { RECIPES } from "../src/lib/recipes";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: process.env.DEMO_EMAIL ?? "owner@mediaops.local" },
    update: {},
    create: { email: process.env.DEMO_EMAIL ?? "owner@mediaops.local", name: "Media owner" },
  });
  await prisma.brandProfile.upsert({
    where: { id: "4f9411d7-a7a7-49cc-8263-752c90a8a111" },
    update: { logoPublicId: process.env.CLOUDINARY_LOGO_PUBLIC_ID || null },
    create: {
      id: "4f9411d7-a7a7-49cc-8263-752c90a8a111",
      ownerId: user.id,
      name: "MediaOps Brand",
      logoPublicId: process.env.CLOUDINARY_LOGO_PUBLIC_ID || null,
    },
  });
  await prisma.transformationTemplateVersion.upsert({
    where: { key_version: { key: "event-recap", version: 1 } },
    update: {},
    create: { key: "event-recap", version: 1, definition: RECIPES },
  });
}

main().finally(() => prisma.$disconnect());
