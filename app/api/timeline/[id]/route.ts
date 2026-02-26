import { requireAdmin, unauthorized, badRequest, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateSchema = z.object({
  time: z.string().max(10).optional(),
  title: z.string().min(1).max(200).optional(),
  owner: z.string().max(100).optional(),
  done: z.boolean().optional(),
  category: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
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
    const item = await prisma.timelineItem.update({ where: { id: itemId }, data: result.data });
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
    await prisma.timelineItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch { return notFound(); }
}
