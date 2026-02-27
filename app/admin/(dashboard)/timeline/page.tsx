import TimelineClient from "@/components/admin/TimelineClient";
import { prisma } from "@/lib/db";

export default async function TimelinePage() {
  const items = await prisma.timelineItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { time: "asc" }],
  });
  return <TimelineClient initialItems={items} />;
}
