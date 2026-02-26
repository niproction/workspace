import AlcoholClient from "@/components/admin/AlcoholClient";
import { prisma } from "@/lib/db";

export default async function AlcoholPage() {
  const items = await prisma.alcoholItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return <AlcoholClient initialItems={items} />;
}
