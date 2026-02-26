import { requireAdmin, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guestsToCSV } from "@/lib/csv";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const guests = await prisma.guest.findMany({
    orderBy: { createdAt: "asc" },
  });

  const csv = guestsToCSV(guests);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guests-${Date.now()}.csv"`,
    },
  });
}
