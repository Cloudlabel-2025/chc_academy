import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TaskDocument } from "@/models/TaskDocument";
import { getAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
const allowed = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export async function GET(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await connectToDatabase();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const requested = url.searchParams.get("email");

  if (id) {
    const row = await TaskDocument.findOne({ id }).lean();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (row.email !== user.email && !(await isTrainer(user))) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // Redirect to Cloudinary secure URL for direct browser download
    return NextResponse.redirect(row.cloudinaryUrl);
  }

  const email = requested && (await isTrainer(user)) ? requested.toLowerCase() : user.email;
  const documents = await TaskDocument.find({ email }).lean();
  return NextResponse.json({ documents });
}

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const taskId = String(form.get("taskId") || "").trim();
  const documentType = String(form.get("documentType") || "");

  if (!(file instanceof File) || !taskId || !["design", "uat"].includes(documentType)) {
    return NextResponse.json({ error: "File, task and document type are required" }, { status: 400 });
  }

  if (file.size > 12 * 1024 * 1024 || !allowed.has(file.type)) {
    return NextResponse.json({ error: "Use PDF, DOC, DOCX or XLSX up to 12 MB" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: `oracle-hcm-academy/task-submissions/${encodeURIComponent(user.email)}/${taskId}`,
      public_id: `${id}-${safeName}`,
      resource_type: "raw",
    });

    await connectToDatabase();
    await TaskDocument.create({
      id,
      email: user.email,
      taskId: taskId.slice(0, 50),
      documentType,
      fileName: file.name.slice(0, 180),
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.secure_url,
      contentType: file.type,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id, url: uploadResult.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "File required" }, { status: 400 });

  await connectToDatabase();
  const row = await TaskDocument.findOne({ id });
  if (!row) return NextResponse.json({ ok: true });

  if (row.email !== user.email && !(await isTrainer(user))) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    if (row.cloudinaryPublicId) {
      await deleteFromCloudinary(row.cloudinaryPublicId, "raw");
    }
  } catch (err) {
    console.warn("Cloudinary delete warning:", err);
  }

  await TaskDocument.deleteOne({ id, email: row.email });
  return NextResponse.json({ ok: true });
}
