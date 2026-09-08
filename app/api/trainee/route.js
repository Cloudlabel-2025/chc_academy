import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TraineeProfile } from "@/models/TraineeProfile";
import { TraineeProgress } from "@/models/TraineeProgress";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await connectToDatabase();
  const profile = await TraineeProfile.findOne({ email: user.email }).lean();
  const progress = await TraineeProgress.find({ email: user.email }).lean();

  return NextResponse.json({ user, profile: profile ?? null, progress });
}

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json();

  const fullName = (body.fullName || user.fullName || user.displayName).trim().slice(0, 100);
  const cohort = (body.cohort || "").trim().slice(0, 60);
  const subscriptionPlan = ["foundation", "practitioner", "guided"].includes(body.subscriptionPlan || "")
    ? body.subscriptionPlan
    : "practitioner";
  const targetLevel = subscriptionPlan === "foundation" ? 3 : 5;
  const experienceGoal = (body.experienceGoal || "2–4 years").trim().slice(0, 60);
  const learningPath = ["functional", "technical", "both"].includes(body.learningPath || "")
    ? body.learningPath
    : "both";
  const customerRoute = ["career", "professional"].includes(body.customerRoute || "")
    ? body.customerRoute
    : "career";
  const masteryArea = (body.masteryArea || "").trim().slice(0, 80);

  if (!fullName || !cohort) {
    return NextResponse.json({ error: "Name and cohort are required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  await connectToDatabase();

  await TraineeProfile.findOneAndUpdate(
    { email: user.email },
    {
      $set: {
        fullName,
        cohort,
        targetLevel,
        experienceGoal,
        learningPath,
        customerRoute,
        subscriptionPlan,
        masteryArea,
        updatedAt: now,
      },
      $setOnInsert: {
        email: user.email,
        approvedLevel: 0,
        levelFeedback: "",
        levelApprovedBy: null,
        levelApprovedAt: null,
        joinedAt: now,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true });
}

export async function PATCH(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json();
  const update = { updatedAt: new Date().toISOString() };

  if (body.learningPath !== undefined) {
    if (!["functional", "technical", "both"].includes(body.learningPath)) {
      return NextResponse.json({ error: "Choose a valid pathway" }, { status: 400 });
    }
    update.learningPath = body.learningPath;
  }

  if (body.customerRoute !== undefined) {
    if (!["career", "professional"].includes(body.customerRoute)) {
      return NextResponse.json({ error: "Choose a valid customer route" }, { status: 400 });
    }
    update.customerRoute = body.customerRoute;
  }

  if (body.subscriptionPlan !== undefined) {
    if (!["foundation", "practitioner", "guided"].includes(body.subscriptionPlan)) {
      return NextResponse.json({ error: "Choose a valid programme" }, { status: 400 });
    }
    update.subscriptionPlan = body.subscriptionPlan;
    update.targetLevel = body.subscriptionPlan === "foundation" ? 3 : 5;
  }

  if (body.masteryArea !== undefined) {
    update.masteryArea = body.masteryArea.trim().slice(0, 80);
  }

  await connectToDatabase();
  await TraineeProfile.findOneAndUpdate({ email: user.email }, { $set: update });
  return NextResponse.json({ ok: true });
}
