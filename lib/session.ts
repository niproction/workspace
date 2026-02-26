import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  adminId?: number;
  adminEmail?: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  cookieName: "ws_admin_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.adminId) {
    throw new Error("Unauthorized");
  }
  return session;
}
