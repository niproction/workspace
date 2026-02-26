import { requireAdmin, unauthorized, badRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ItemSchema = z.object({
  categoryId: z.number().int(),
  description: z.string().min(1).max(200),
  planned: z.number().min(0).default(0),
  actual: z.number().min(0).default(0),
  paid: z.boolean().default(false),
  notes: z.string().max(500).default(""),
});

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const result = ItemSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  const item = await prisma.budgetItem.create({ data: result.data });
  return NextResponse.json(item, { status: 201 });
}
