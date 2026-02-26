import VendorsClient from "@/components/admin/VendorsClient";
import { prisma } from "@/lib/db";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
  });
  return <VendorsClient initialVendors={vendors} />;
}
