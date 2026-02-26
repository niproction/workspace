import { Guest } from "@prisma/client";
import { prisma } from "./db";

/** Normalize a name for deduplication: lowercase, trim, collapse spaces */
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Normalize a phone number: keep only digits */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Find a potential duplicate guest by name or phone */
export async function findDuplicate(
  name: string,
  phone: string
): Promise<Guest | null> {
  const normalizedName = normalizeName(name);
  const normalizedPhone = normalizePhone(phone);

  const guests = await prisma.guest.findMany({
    where: { isDuplicate: false },
  });

  for (const g of guests) {
    const gName = normalizeName(g.name);
    const gPhone = normalizePhone(g.phone);

    if (normalizedPhone && gPhone && normalizedPhone === gPhone) return g;
    if (normalizedName === gName) return g;
  }

  return null;
}

export interface RSVPInput {
  name: string;
  phone: string;
  email: string;
  attending: boolean;
  guestCount: number;
  side: string;
  mealChoice: string;
  allergies: string;
  notes: string;
}

/** Create or update RSVP. Returns { guest, isDuplicate } */
export async function upsertRSVP(input: RSVPInput): Promise<{ guest: Guest; wasDuplicate: boolean }> {
  const existing = await findDuplicate(input.name, input.phone);

  if (existing) {
    const updated = await prisma.guest.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        attending: input.attending,
        guestCount: input.guestCount,
        side: input.side,
        mealChoice: input.mealChoice,
        allergies: input.allergies,
        notes: input.notes,
        submittedAt: new Date(),
        source: "rsvp",
      },
    });
    return { guest: updated, wasDuplicate: true };
  }

  const created = await prisma.guest.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email || "",
      attending: input.attending,
      guestCount: input.guestCount,
      side: input.side,
      mealChoice: input.mealChoice,
      allergies: input.allergies || "",
      notes: input.notes || "",
      submittedAt: new Date(),
      source: "rsvp",
    },
  });

  return { guest: created, wasDuplicate: false };
}
