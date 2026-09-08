import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InterviewAudio } from "@/models/InterviewAudio";
import { getAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await connectToDatabase();
  const u = new URL(request.url);
  const id = u.searchParams.get("id");
  const sessionId = u.searchParams.get("sessionId");
  const requested = u.searchParams.get("email");

  if (id) {
    const row = await InterviewAudio.findOne({ id }).lean();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (row.email !== user.email && !(await isTrainer(user))) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    return NextResponse.redirect(row.cloudinaryUrl);
  }

  const email = requested && (await isTrainer(user)) ? requested.toLowerCase() : user.email;
  const filter: any = { email };
  if (sessionId) filter.sessionId = sessionId;

  const rows = await InterviewAudio.find(filter).lean();
  return NextResponse.json({
    audio: rows.map(({ cloudinaryPublicId, ...x }: any) => ({
      ...x,
      url: x.cloudinaryUrl,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("audio");
  const sessionId = String(form.get("sessionId") || "");
  const questionIndex = Number(form.get("questionIndex"));

  if (!(file instanceof File) || !sessionId || !Number.isInteger(questionIndex)) {
    return NextResponse.json({ error: "Audio, session and question are required" }, { status: 400 });
  }

  if (file.size > 15 * 1024 * 1024 || !file.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Audio must be under 15 MB" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: `oracle-hcm-academy/interview-audio/${encodeURIComponent(user.email)}/${sessionId}`,
      public_id: `${questionIndex}-${id}`,
      resource_type: "video", // Cloudinary treats audio as video resource type
    });

    await connectToDatabase();
    await InterviewAudio.create({
      id,
      email: user.email,
      sessionId: sessionId.slice(0, 80),
      questionIndex,
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.secure_url,
      contentType: file.type,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id, url: uploadResult.secure_url });
  } catch (error: any) {
    console.error("Cloudinary audio upload error:", error);
    return NextResponse.json({ error: "Failed to upload audio" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Recording required" }, { status: 400 });

  await connectToDatabase();
  const row = await InterviewAudio.findOne({ id, email: user.email });
  if (!row) return NextResponse.json({ ok: true });

  try {
    if (row.cloudinaryPublicId) {
      await deleteFromCloudinary(row.cloudinaryPublicId, "video");
    }
  } catch (err) {
    console.warn("Cloudinary audio delete warning:", err);
  }

  await InterviewAudio.deleteOne({ id, email: user.email });
  return NextResponse.json({ ok: true });
}
