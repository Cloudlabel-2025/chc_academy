import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TraineeProgress } from "@/models/TraineeProgress";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
const allowed = new Set(["not_started", "in_progress", "submitted", "reviewed", "completed"]);

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const b = (await request.json()) as {
    itemType?: string;
    itemId?: string;
    area?: string;
    title?: string;
    level?: number | null;
    status?: "not_started" | "in_progress" | "submitted" | "reviewed" | "completed";
    notes?: string;
  };

  if (!b.itemType || !b.itemId || !b.area || !b.title || !b.status || !allowed.has(b.status)) {
    return NextResponse.json({ error: "Invalid progress update" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const row = {
    email: user.email,
    itemType: b.itemType.slice(0, 20),
    itemId: b.itemId.slice(0, 50),
    area: b.area.slice(0, 80),
    title: b.title.slice(0, 160),
    level: b.level ? Math.min(5, Math.max(1, Number(b.level))) : null,
    status: b.status,
    notes: (b.notes || "").slice(0, 1000),
    updatedAt: now,
  };

  await connectToDatabase();
  await TraineeProgress.findOneAndUpdate(
    { email: row.email, itemType: row.itemType, itemId: row.itemId },
    {
      $set: {
        area: row.area,
        title: row.title,
        level: row.level,
        status: row.status,
        notes: row.notes,
        updatedAt: row.updatedAt,
      },
      $setOnInsert: {
        email: row.email,
        itemType: row.itemType,
        itemId: row.itemId,
        trainerFeedback: "",
        reviewedBy: null,
        reviewedAt: null,
        requirementScore: 0,
        designScore: 0,
        uatScore: 0,
        evidenceScore: 0,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, row });
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const u = new URL(request.url);
  const itemType = u.searchParams.get("itemType");
  const itemId = u.searchParams.get("itemId");

  if (!itemType || !itemId) return NextResponse.json({ error: "Missing item" }, { status: 400 });

  await connectToDatabase();
  await TraineeProgress.deleteOne({ email: user.email, itemType, itemId });
  return NextResponse.json({ ok: true });
}
