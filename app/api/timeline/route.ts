import { requireAdmin, unauthorized, badRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const items = await prisma.timelineItem.findMany({ orderBy: [{ sortOrder: "asc" }, { time: "asc" }] });
  return NextResponse.json(items);
}

const ItemSchema = z.object({
  time: z.string().max(10).default(""),
  title: z.string().min(1).max(200),
  owner: z.string().max(100).default(""),
  done: z.boolean().default(false),
  category: z.string().max(50).default("general"),
  notes: z.string().max(500).default(""),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const result = ItemSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  const item = await prisma.timelineItem.create({ data: result.data });
  return NextResponse.json(item, { status: 201 });
}
