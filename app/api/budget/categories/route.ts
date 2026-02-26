import { requireAdmin, unauthorized, badRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const categories = await prisma.budgetCategory.findMany({
    include: { items: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const result = z.object({ name: z.string().min(1).max(100), sortOrder: z.number().int().default(0) }).safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  const cat = await prisma.budgetCategory.create({ data: result.data, include: { items: true } });
  return NextResponse.json(cat, { status: 201 });
}
