import GuestsClient from "@/components/admin/GuestsClient";
import { prisma } from "@/lib/db";

export default async function GuestsPage() {
  const guests = await prisma.guest.findMany({ orderBy: { createdAt: "desc" } });
  return <GuestsClient initialGuests={guests} />;
}
