import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { LessonResource } from "@/models/LessonResource";
import { getAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";

export const dynamic = "force-dynamic";
const types = ["trainer_video", "youtube", "oracle_docs", "customer_connect", "other"];

async function checkTrainer() {
  const u = await getAuthUser();
  if (!u) return null;
  return (await isTrainer(u)) ? u : null;
}

export async function GET(request) {
  const url = new URL(request.url);
  const manage = url.searchParams.get("manage") === "1";
  const lessonKey = url.searchParams.get("lessonKey");

  if (manage && !(await checkTrainer())) {
    return NextResponse.json({ error: "Trainer access required" }, { status: 403 });
  }

  await connectToDatabase();
  const filter = {};
  if (!manage) filter.visible = 1;
  if (lessonKey) filter.lessonKey = lessonKey.toUpperCase();

  const rows = await LessonResource.find(filter).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ resources: rows });
}

export async function POST(request) {
  const u = await checkTrainer();
  if (!u) return NextResponse.json({ error: "Trainer access required" }, { status: 403 });

  const b = await request.json();
  const title = String(b.title || "").trim();
  const url = String(b.url || "").trim();
  const lessonTitle = String(b.lessonTitle || "").trim();
  const lessonKey = String(b.lessonKey || "").trim().toUpperCase();
  const resourceType = String(b.resourceType || "");

  if (!title || !lessonTitle || !lessonKey || !types.includes(resourceType)) {
    return NextResponse.json({ error: "Complete all required fields" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Use a valid http or https link" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = String(b.id || crypto.randomUUID());

  await connectToDatabase();
  await LessonResource.findOneAndUpdate(
    { id },
    {
      $set: {
        id,
        area: String(b.area || "General").trim(),
        lessonKey,
        lessonTitle,
        resourceType,
        title,
        url,
        oracleRelease: String(b.oracleRelease || "").trim(),
        mandatory: b.mandatory ? 1 : 0,
        visible: b.visible ? 1 : 0,
        reviewedAt: String(b.reviewedAt || now.slice(0, 10)),
        reviewedBy: u.email,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, id });
}

export async function PATCH(request) {
  const u = await checkTrainer();
  if (!u) return NextResponse.json({ error: "Trainer access required" }, { status: 403 });

  const b = await request.json();
  if (!b.id) return NextResponse.json({ error: "Resource id required" }, { status: 400 });

  await connectToDatabase();
  await LessonResource.findOneAndUpdate(
    { id: b.id },
    {
      $set: {
        visible: b.visible ? 1 : 0,
        reviewedBy: u.email,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  return NextResponse.json({ ok: true });
}
