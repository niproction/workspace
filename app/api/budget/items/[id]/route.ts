import { requireAdmin, unauthorized, badRequest, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  planned: z.number().min(0).optional(),
  actual: z.number().min(0).optional(),
  paid: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) return badRequest("Invalid ID");

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const result = UpdateSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  try {
    const item = await prisma.budgetItem.update({ where: { id: itemId }, data: result.data });
    return NextResponse.json(item);
  } catch { return notFound(); }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) return badRequest("Invalid ID");

  try {
    await prisma.budgetItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch { return notFound(); }
}
