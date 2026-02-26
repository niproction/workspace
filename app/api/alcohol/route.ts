import { requireAdmin, unauthorized, badRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const items = await prisma.alcoholItem.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return NextResponse.json(items);
}

const AlcoholSchema = z.object({
  category: z.enum(["whisky", "vodka", "gin", "arak", "wine", "beer", "champagne", "other"]),
  name: z.string().min(1).max(200),
  volumeMl: z.number().int().min(1).default(750),
  abv: z.number().min(0).max(100).default(0),
  pricePerUnit: z.number().min(0).default(0),
  quantity: z.number().int().min(0).default(0),
  lowStockAt: z.number().int().min(0).default(2),
  status: z.enum(["planned", "purchased", "arrived", "opened"]).default("planned"),
  notes: z.string().max(500).default(""),
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

  const result = AlcoholSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  const item = await prisma.alcoholItem.create({ data: result.data });
  return NextResponse.json(item, { status: 201 });
}
