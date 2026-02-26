import { requireAdmin, unauthorized, badRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const vendors = await prisma.vendor.findMany({
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(vendors);
}

const VendorSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(50).default("other"),
  contactName: z.string().max(100).default(""),
  phone: z.string().max(30).default(""),
  email: z.string().max(200).default(""),
  status: z.enum(["not_contacted", "negotiating", "booked"]).default("not_contacted"),
  depositAmount: z.number().min(0).default(0),
  depositPaid: z.boolean().default(false),
  depositDueDate: z.string().max(10).default(""),
  finalAmount: z.number().min(0).default(0),
  finalPaid: z.boolean().default(false),
  finalDueDate: z.string().max(10).default(""),
  notes: z.string().max(2000).default(""),
});

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const result = VendorSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  const vendor = await prisma.vendor.create({ data: result.data, include: { attachments: true } });
  return NextResponse.json(vendor, { status: 201 });
}
