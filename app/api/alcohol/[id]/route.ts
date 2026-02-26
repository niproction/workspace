import { requireAdmin, unauthorized, badRequest, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateSchema = z.object({
  category: z.enum(["whisky", "vodka", "gin", "arak", "wine", "beer", "champagne", "other"]).optional(),
  name: z.string().min(1).max(200).optional(),
  volumeMl: z.number().int().min(1).optional(),
  abv: z.number().min(0).max(100).optional(),
  pricePerUnit: z.number().min(0).optional(),
  quantity: z.number().int().min(0).optional(),
  lowStockAt: z.number().int().min(0).optional(),
  status: z.enum(["planned", "purchased", "arrived", "opened"]).optional(),
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
    const item = await prisma.alcoholItem.update({ where: { id: itemId }, data: result.data });
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
    await prisma.alcoholItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch { return notFound(); }
}
