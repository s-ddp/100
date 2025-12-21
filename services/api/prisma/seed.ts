import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // минимальные справочники
  const vesselId = "vessel-meteor";
  await prisma.vessel.upsert({
    where: { id: vesselId },
    update: { name: "Метеор" },
    create: { id: vesselId, name: "Метеор" },
  });

  const eventId = "event-meteor-kronshtadt-petergof";
  await prisma.event.upsert({
    where: { id: eventId },
    update: {
      title: "Метеор Кронштадт → Петергоф",
      description: "Скоростная прогулка на метеоре",
      city: "СПб",
      category: "water",
      hasSeating: true,
      vesselId,
      durationMinutes: 45,
      image: "/images/meteor.jpg"
    },
    create: {
      id: eventId,
      title: "Метеор Кронштадт → Петергоф",
      description: "Скоростная прогулка на метеоре",
      city: "СПб",
      category: "water",
      hasSeating: true,
      vesselId,
      durationMinutes: 45,
      image: "/images/meteor.jpg"
    },
  });

  const catA = await prisma.seatCategory.upsert({
    where: { code: "A" },
    update: { name: "Категория A" },
    create: { code: "A", name: "Категория A" },
  });

  // несколько мест
  for (let i = 1; i <= 10; i++) {
    await prisma.seat.upsert({
      where: { externalId: `seat-${i}` },
      update: {
        eventId,
        seatCode: `A-${i}`,
        alias: `A-${i}`,
        externalId: `seat-${i}`,
        label: `${i}`,
        zone: "A",
        categoryId: catA.id,
        isActive: true,
      },
      create: {
        eventId,
        seatCode: `A-${i}`,
        alias: `A-${i}`,
        externalId: `seat-${i}`,
        label: `${i}`,
        zone: "A",
        categoryId: catA.id,
        isActive: true,
      },
    });
  }

  // ticket types + price
  const ttAdult = await prisma.ticketType.upsert({
    where: { code: "ADULT" },
    update: { name: "Взрослый" },
    create: { code: "ADULT", name: "Взрослый" },
  });

  await prisma.ticketPrice.create({
    data: {
      eventId,
      ticketTypeId: ttAdult.id,
      seatCategoryId: catA.id,
      price: 2500,
      currency: "RUB",
    },
  });

  console.log("✅ Seed done");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
