import { badRequest, requireAdmin, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toPublicConfig } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const config = await prisma.weddingConfig.findUnique({ where: { id: 1 } });
  if (!config) return NextResponse.json({});
  return NextResponse.json(toPublicConfig(config));
}

const UpdateConfigSchema = z.object({
  groomNameHe: z.string().max(100).optional(),
  groomNameEn: z.string().max(100).optional(),
  brideNameHe: z.string().max(100).optional(),
  brideNameEn: z.string().max(100).optional(),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ceremonyTime: z.string().max(10).optional(),
  receptionTime: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  venueNameHe: z.string().max(200).optional(),
  venueNameEn: z.string().max(200).optional(),
  venueAddress: z.string().max(300).optional(),
  venueWazeUrl: z.string().max(500).optional(),
  venueMapsUrl: z.string().max(500).optional(),
  rsvpDeadline: z.string().max(10).optional(),
  mealOptions: z.array(z.string()).optional(),
  faqContent: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const result = UpdateConfigSchema.safeParse(body);
  if (!result.success) return badRequest("Invalid input");

  const { mealOptions, faqContent, ...rest } = result.data;
  const data: Record<string, unknown> = { ...rest };
  if (mealOptions !== undefined) data.mealOptions = JSON.stringify(mealOptions);
  if (faqContent !== undefined) data.faqContent = JSON.stringify(faqContent);

  const updated = await prisma.weddingConfig.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  return NextResponse.json(updated);
}
