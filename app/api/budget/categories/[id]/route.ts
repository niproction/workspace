import { requireAdmin, unauthorized, badRequest, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const catId = parseInt(id, 10);
  if (isNaN(catId)) return badRequest("Invalid ID");

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const result = z.object({ name: z.string().min(1).max(100).optional(), sortOrder: z.number().int().optional() }).safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  try {
    const cat = await prisma.budgetCategory.update({ where: { id: catId }, data: result.data, include: { items: true } });
    return NextResponse.json(cat);
  } catch { return notFound(); }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const catId = parseInt(id, 10);
  if (isNaN(catId)) return badRequest("Invalid ID");

  try {
    await prisma.budgetCategory.delete({ where: { id: catId } });
    return NextResponse.json({ success: true });
  } catch { return notFound(); }
}
