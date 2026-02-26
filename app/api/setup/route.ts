import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SetupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function GET() {
  const count = await prisma.adminUser.count();
  return NextResponse.json({ setupRequired: count === 0 });
}

export async function POST(req: NextRequest) {
  // Only allow if no admin exists
  const count = await prisma.adminUser.count();
  if (count > 0) {
    return NextResponse.json(
      { error: "Setup already completed. Admin account already exists." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = SetupSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = result.data;
  const passwordHash = await hashPassword(password);

  await prisma.adminUser.create({
    data: { email, passwordHash },
  });

  // Seed WeddingConfig if not exists
  await prisma.weddingConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      groomNameHe: "ניסן חנוכה",
      groomNameEn: "Nissan Hanouka",
      brideNameHe: "רוני אזולאי",
      brideNameEn: "Roni Azulay",
      weddingDate: "2026-07-08",
      ceremonyTime: "18:00",
      receptionTime: "",
      timezone: "Asia/Jerusalem",
      venueNameHe: "",
      venueNameEn: "",
      venueAddress: "",
      venueWazeUrl: "",
      venueMapsUrl: "",
      rsvpDeadline: "",
      mealOptions: JSON.stringify(["בשר", "דגים", "צמחוני"]),
      faqContent: JSON.stringify([]),
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
