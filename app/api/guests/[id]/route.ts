import { requireAdmin, unauthorized, badRequest, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().max(200).optional(),
  side: z.enum(["groom", "bride", "other"]).optional(),
  attending: z.boolean().nullable().optional(),
  guestCount: z.number().int().min(1).max(20).optional(),
  mealChoice: z.string().max(100).optional(),
  allergies: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  const guestId = parseInt(id, 10);
  if (isNaN(guestId)) return badRequest("Invalid ID");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const result = UpdateSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  try {
    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: result.data,
    });
    return NextResponse.json(guest);
  } catch {
    return notFound();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  const guestId = parseInt(id, 10);
  if (isNaN(guestId)) return badRequest("Invalid ID");

  try {
    await prisma.guest.delete({ where: { id: guestId } });
    return NextResponse.json({ success: true });
  } catch {
    return notFound();
  }
}
