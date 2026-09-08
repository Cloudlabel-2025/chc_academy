import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TraineeProfile } from "@/models/TraineeProfile";
import { TraineeProgress } from "@/models/TraineeProgress";
import { TraineeTimeLog } from "@/models/TraineeTimeLog";
import { getAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";

export const dynamic = "force-dynamic";

async function checkTrainer() {
  const user = await getAuthUser();
  if (!user) return null;
  return (await isTrainer(user)) ? user : null;
}

export async function GET() {
  const user = await checkTrainer();
  if (!user) return NextResponse.json({ error: "Trainer access required" }, { status: 403 });

  await connectToDatabase();
  const trainees = await TraineeProfile.find({}).lean();
  const progress = await TraineeProgress.find({}).lean();
  const timeLogs = await TraineeTimeLog.find({}).lean();

  return NextResponse.json({ trainer: user, trainees, progress, timeLogs });
}

export async function POST(request) {
  const user = await checkTrainer();
  if (!user) return NextResponse.json({ error: "Trainer access required" }, { status: 403 });

  const b = await request.json();
  const email = (b.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Trainee is required" }, { status: 400 });

  const now = new Date().toISOString();
  await connectToDatabase();

  if (b.action === "review_task") {
    if (
      !b.itemType ||
      !b.itemId ||
      !["submitted", "reviewed", "completed", "in_progress"].includes(b.decision || "")
    ) {
      return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    }

    const score = (x) => Math.min(5, Math.max(0, Number(x) || 0));

    await TraineeProgress.findOneAndUpdate(
      { email, itemType: b.itemType, itemId: b.itemId },
      {
        $set: {
          status: b.decision,
          trainerFeedback: (b.feedback || "").trim().slice(0, 1500),
          reviewedBy: user.email,
          reviewedAt: now,
          requirementScore: score(b.requirementScore),
          designScore: score(b.designScore),
          uatScore: score(b.uatScore),
          evidenceScore: score(b.evidenceScore),
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({ ok: true });
  }

  if (b.action === "approve_level") {
    const approvedLevel = Math.min(5, Math.max(0, Number(b.approvedLevel) || 0));

    await TraineeProfile.findOneAndUpdate(
      { email },
      {
        $set: {
          approvedLevel,
          levelFeedback: (b.feedback || "").trim().slice(0, 1500),
          levelApprovedBy: user.email,
          levelApprovedAt: now,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
