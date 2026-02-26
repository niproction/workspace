import { requireAdmin, unauthorized, badRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const side = searchParams.get("side") ?? "";
  const attending = searchParams.get("attending") ?? "";

  const guests = await prisma.guest.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
      ...(side ? { side } : {}),
      ...(attending === "yes"
        ? { attending: true }
        : attending === "no"
        ? { attending: false }
        : attending === "pending"
        ? { attending: null }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(guests);
}

const GuestSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).default(""),
  email: z.string().max(200).default(""),
  side: z.enum(["groom", "bride", "other"]).default("other"),
  attending: z.boolean().nullable().default(null),
  guestCount: z.number().int().min(1).max(20).default(1),
  mealChoice: z.string().max(100).default(""),
  allergies: z.string().max(500).default(""),
  notes: z.string().max(1000).default(""),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const result = GuestSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  const guest = await prisma.guest.create({
    data: { ...result.data, source: "manual" },
  });

  return NextResponse.json(guest, { status: 201 });
}
