import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TrainerRequest } from "@/models/TrainerRequest";
import { UserRole } from "@/models/UserRole";
import { getAuthUser } from "@/lib/auth";
import { canApproveTrainers } from "@/app/trainer-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await connectToDatabase();
  if (await canApproveTrainers(user)) {
    const requests = await TrainerRequest.find({}).sort({ requestedAt: -1 }).lean();
    return NextResponse.json({ approver: true, requests });
  }

  const request = await TrainerRequest.findOne({ email: user.email.toLowerCase() }).lean();
  return NextResponse.json({ approver: false, request: request || null });
}

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json();
  const now = new Date().toISOString();
  await connectToDatabase();

  if (body.action === "request") {
    const email = user.email.toLowerCase();
    const fullName = (user.fullName || user.displayName || user.email).slice(0, 120);
    const reason = (body.reason || "").trim().slice(0, 600);

    await TrainerRequest.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          fullName,
          reason,
          status: "pending",
          requestedAt: now,
          decidedBy: null,
          decidedAt: null,
          decisionNote: "",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true, status: "pending" });
  }

  if (!(await canApproveTrainers(user))) {
    return NextResponse.json({ error: "Trainer Approver access required" }, { status: 403 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !["approve", "reject"].includes(body.action || "")) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const status = body.action === "approve" ? "approved" : "rejected";
  const note = (body.note || "").trim().slice(0, 600);

  await TrainerRequest.findOneAndUpdate(
    { email },
    {
      $set: {
        status,
        decidedBy: user.email.toLowerCase(),
        decidedAt: now,
        decisionNote: note,
      },
    }
  );

  if (status === "approved") {
    await UserRole.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          role: "trainer",
          grantedBy: user.email.toLowerCase(),
          grantedAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, new: true }
    );
  }

  return NextResponse.json({ ok: true, status });
}
