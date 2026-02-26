import { requireAdmin, unauthorized, badRequest, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().max(50).optional(),
  contactName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(200).optional(),
  status: z.enum(["not_contacted", "negotiating", "booked"]).optional(),
  depositAmount: z.number().min(0).optional(),
  depositPaid: z.boolean().optional(),
  depositDueDate: z.string().max(10).optional(),
  finalAmount: z.number().min(0).optional(),
  finalPaid: z.boolean().optional(),
  finalDueDate: z.string().max(10).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const vendorId = parseInt(id, 10);
  if (isNaN(vendorId)) return badRequest("Invalid ID");

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const result = UpdateSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  try {
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: result.data,
      include: { attachments: true },
    });
    return NextResponse.json(vendor);
  } catch { return notFound(); }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const vendorId = parseInt(id, 10);
  if (isNaN(vendorId)) return badRequest("Invalid ID");

  try {
    // Cascade deletes attachments via Prisma schema
    await prisma.vendor.delete({ where: { id: vendorId } });
    return NextResponse.json({ success: true });
  } catch { return notFound(); }
}
