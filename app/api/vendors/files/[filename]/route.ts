import { requireAdmin, unauthorized, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readUpload } from "@/lib/uploads";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { filename } = await params;

  // Validate filename format to prevent path traversal
  if (!/^[a-f0-9-]{36}\.[a-z]{2,4}$/.test(filename)) {
    return notFound();
  }

  const attachment = await prisma.vendorAttachment.findFirst({
    where: { filename },
  });
  if (!attachment) return notFound();

  const buffer = await readUpload(filename);
  if (!buffer) return notFound();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
