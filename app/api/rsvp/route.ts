import { prisma } from "@/lib/db";
import { upsertRSVP } from "@/lib/rsvp";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// In-memory rate limiter: IP → { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const RSVPSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).default(""),
  email: z.string().email().or(z.literal("")).default(""),
  attending: z.boolean(),
  guestCount: z.number().int().min(1).max(20),
  side: z.enum(["groom", "bride", "other"]),
  mealChoice: z.string().max(100).default(""),
  allergies: z.string().max(500).default(""),
  notes: z.string().max(1000).default(""),
  // Honeypot field — must be empty
  website: z.string().max(0).default(""),
});

export async function POST(req: NextRequest) {
  // Host/origin check — only accept same-origin requests
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.includes(host.split(":")[0])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // IP rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "יותר מדי בקשות. נסה שוב מאוחר יותר." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = RSVPSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "נתונים לא תקינים.", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { website, ...input } = result.data;

  // Honeypot: if website field is filled, silently reject
  if (website && website.length > 0) {
    return NextResponse.json({ success: true }); // Silent reject
  }

  // Check if RSVP is still open
  const config = await prisma.weddingConfig.findUnique({ where: { id: 1 } });
  if (config?.rsvpDeadline) {
    const deadline = new Date(config.rsvpDeadline);
    if (Date.now() > deadline.getTime()) {
      return NextResponse.json(
        { error: "תקופת האישור נסגרה." },
        { status: 410 }
      );
    }
  }

  try {
    const { guest, wasDuplicate } = await upsertRSVP(input);
    return NextResponse.json(
      { success: true, guestId: guest.id, wasDuplicate },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "שגיאת שרת. נסה שוב." },
      { status: 500 }
    );
  }
}
