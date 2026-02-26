import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed WeddingConfig singleton (row id=1)
  await prisma.weddingConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      groomNameHe: "ניסן חנוכה",
      groomNameEn: "Nissan Hanouka",
      brideNameHe: "רוני אזולאי",
      brideNameEn: "Roni Azulay",
      weddingDate: "2026-07-08",
      ceremonyTime: "18:00",
      receptionTime: "",
      timezone: "Asia/Jerusalem",
      venueNameHe: "",
      venueNameEn: "",
      venueAddress: "",
      venueWazeUrl: "",
      venueMapsUrl: "",
      rsvpDeadline: "",
      mealOptions: JSON.stringify(["בשר", "דגים", "צמחוני"]),
      faqContent: JSON.stringify([
        { q: "מה לובשים?", a: "לבוש מכובד / חגיגי." },
        { q: "האם יש חניה?", a: "כן, חניה חינם בשטח האולם." },
      ]),
    },
  });

  // Seed default timeline items
  const defaultTimeline = [
    { time: "16:00", title: "הכנות אחרונות", owner: "ניסן", sortOrder: 1 },
    { time: "17:00", title: "קבלת פנים", owner: "", sortOrder: 2 },
    { time: "18:00", title: "טקס חופה", owner: "", sortOrder: 3 },
    { time: "19:00", title: "ארוחת ערב", owner: "", sortOrder: 4 },
    { time: "20:00", title: "ריקודים", owner: "", sortOrder: 5 },
    { time: "23:30", title: "סיום", owner: "", sortOrder: 6 },
  ];

  for (const item of defaultTimeline) {
    await prisma.timelineItem.upsert({
      where: { id: item.sortOrder },
      update: {},
      create: item,
    });
  }

  console.log("✓ Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
