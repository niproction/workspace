import { Guest } from "@prisma/client";

const HEADERS = [
  "ID",
  "שם",
  "טלפון",
  "אימייל",
  "צד",
  "השתתפות",
  "מספר אורחים",
  "העדפת מנה",
  "אלרגיות",
  "הערות",
  "מקור",
  "נשלח",
  "נוצר",
];

function escape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAttending(attending: boolean | null): string {
  if (attending === null || attending === undefined) return "ממתין";
  return attending ? "כן" : "לא";
}

function formatSide(side: string): string {
  if (side === "groom") return "ניסן";
  if (side === "bride") return "רוני";
  return "אחר";
}

export function guestsToCSV(guests: Guest[]): string {
  const rows = guests.map((g) =>
    [
      String(g.id),
      g.name,
      g.phone ? `\t${g.phone}` : "",
      g.email,
      formatSide(g.side),
      formatAttending(g.attending),
      String(g.guestCount),
      g.mealChoice,
      g.allergies,
      g.notes,
      g.source,
      g.submittedAt ? g.submittedAt.toISOString() : "",
      g.createdAt.toISOString(),
    ]
      .map(escape)
      .join(",")
  );

  // BOM ensures Excel opens the file as UTF-8 (required for Hebrew)
  return "\uFEFF" + [HEADERS.join(","), ...rows].join("\r\n");
}
