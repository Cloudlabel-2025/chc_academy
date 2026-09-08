import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InterviewSession } from "@/models/InterviewSession";
import { getAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await connectToDatabase();
  const requested = new URL(request.url).searchParams.get("email");
  const email = requested && (await isTrainer(user)) ? requested.toLowerCase() : user.email;

  const sessions = await InterviewSession.find({ email }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ sessions });
}

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const b = await request.json();

  if (!b.area || !b.years || !Array.isArray(b.answers)) {
    return NextResponse.json({ error: "Invalid interview" }, { status: 400 });
  }

  const id = (b.id || crypto.randomUUID()).slice(0, 80);
  const now = new Date().toISOString();

  await connectToDatabase();
  await InterviewSession.findOneAndUpdate(
    { id },
    {
      id,
      email: user.email,
      area: b.area.slice(0, 80),
      years: Math.min(10, Math.max(1, Number(b.years))),
      score: Math.min(100, Math.max(0, Number(b.score) || 0)),
      strengths: (b.strengths || "").slice(0, 1000),
      gaps: (b.gaps || "").slice(0, 1000),
      answersJson: JSON.stringify(b.answers).slice(0, 50000),
      createdAt: now,
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, id });
}
