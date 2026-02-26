import { requireAdmin, unauthorized, badRequest, notFound } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  isAllowedMime,
  isAllowedSize,
  MAX_SIZE_BYTES,
  safeName,
  saveUpload,
  deleteUpload,
} from "@/lib/uploads";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const vendorId = parseInt(id, 10);
  if (isNaN(vendorId)) return badRequest("Invalid ID");

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) return notFound();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return badRequest("Invalid form data");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return badRequest("No file provided");

  if (!isAllowedMime(file.type)) {
    return badRequest("File type not allowed. Accepted: PDF, JPEG, PNG, WEBP, DOC, DOCX");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!isAllowedSize(buffer.byteLength)) {
    return badRequest(`File too large. Maximum size: ${MAX_SIZE_BYTES / 1024 / 1024}MB`);
  }

  const filename = safeName(file.type);
  await saveUpload(buffer, filename);

  const attachment = await prisma.vendorAttachment.create({
    data: {
      vendorId,
      filename,
      originalName: file.name.slice(0, 200),
      mimeType: file.type,
      sizeBytes: buffer.byteLength,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin(); } catch { return unauthorized(); }

  const { id } = await params;
  const vendorId = parseInt(id, 10);
  if (isNaN(vendorId)) return badRequest("Invalid ID");

  const { searchParams } = new URL(req.url);
  const attachmentId = parseInt(searchParams.get("attachmentId") ?? "", 10);
  if (isNaN(attachmentId)) return badRequest("Missing attachmentId");

  const attachment = await prisma.vendorAttachment.findFirst({
    where: { id: attachmentId, vendorId },
  });
  if (!attachment) return notFound();

  await deleteUpload(attachment.filename);
  await prisma.vendorAttachment.delete({ where: { id: attachmentId } });

  return NextResponse.json({ success: true });
}
