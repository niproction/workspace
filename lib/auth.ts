import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { requireSession } from "./session";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function requireAdmin(): Promise<{ adminId: number; adminEmail: string }> {
  try {
    const session = await requireSession();
    return {
      adminId: session.adminId!,
      adminEmail: session.adminEmail!,
    };
  } catch {
    throw new Error("Unauthorized");
  }
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error"): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}
