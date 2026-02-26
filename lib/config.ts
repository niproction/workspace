import { WeddingConfig } from "@prisma/client";
import { prisma } from "./db";

export async function getWeddingConfig(): Promise<WeddingConfig> {
  const config = await prisma.weddingConfig.upsert({
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
  return config;
}

/** Public-safe subset: never includes private/admin fields */
export type PublicConfig = {
  groomNameHe: string;
  groomNameEn: string;
  brideNameHe: string;
  brideNameEn: string;
  weddingDate: string;
  ceremonyTime: string;
  receptionTime: string;
  timezone: string;
  venueNameHe: string;
  venueNameEn: string;
  venueAddress: string;
  venueWazeUrl: string;
  venueMapsUrl: string;
  rsvpDeadline: string;
  mealOptions: string[];
  faqContent: { q: string; a: string }[];
};

export function toPublicConfig(config: WeddingConfig): PublicConfig {
  return {
    groomNameHe: config.groomNameHe,
    groomNameEn: config.groomNameEn,
    brideNameHe: config.brideNameHe,
    brideNameEn: config.brideNameEn,
    weddingDate: config.weddingDate,
    ceremonyTime: config.ceremonyTime,
    receptionTime: config.receptionTime,
    timezone: config.timezone,
    venueNameHe: config.venueNameHe,
    venueNameEn: config.venueNameEn,
    venueAddress: config.venueAddress,
    venueWazeUrl: config.venueWazeUrl,
    venueMapsUrl: config.venueMapsUrl,
    rsvpDeadline: config.rsvpDeadline,
    mealOptions: JSON.parse(config.mealOptions || "[]"),
    faqContent: JSON.parse(config.faqContent || "[]"),
  };
}

/** Build a timezone-safe ISO string for the wedding date at 18:00 IDT */
export function buildWeddingDateISO(config: PublicConfig): string {
  // Israel standard: UTC+2 (IST), summer (IDT): UTC+3
  // July 8, 2026 is summer → UTC+3
  const timeStr = config.ceremonyTime || "18:00";
  const [h, m] = timeStr.split(":").map(Number);
  // Return ISO with +03:00 offset (IDT)
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${config.weddingDate}T${pad(h)}:${pad(m)}:00+03:00`;
}
