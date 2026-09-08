import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TraineeProfile } from "@/models/TraineeProfile";
import { UserRole } from "@/models/UserRole";
import { hashPassword, signAuthToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
const OWNER_EMAIL = (process.env.ADMIN_EMAIL || "lavanyabalaji123@gmail.com").toLowerCase();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.fullName || "").trim();
    const password = String(body.password || "");

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const role = email === OWNER_EMAIL ? "admin" : "trainee";

    const user = await User.create({
      email,
      fullName,
      passwordHash,
      role,
    });

    const now = new Date().toISOString();

    // Create default trainee profile
    await TraineeProfile.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          email,
          fullName,
          cohort: "Self-Paced 2026",
          targetLevel: 3,
          experienceGoal: "2–4 years",
          learningPath: "both",
          customerRoute: "career",
          subscriptionPlan: "practitioner",
          masteryArea: "",
          approvedLevel: 0,
          levelFeedback: "",
          levelApprovedBy: null,
          levelApprovedAt: null,
          joinedAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, new: true }
    );

    // If owner, record admin role
    if (role === "admin") {
      await UserRole.findOneAndUpdate(
        { email },
        { email, role: "admin", grantedBy: "system", grantedAt: now, updatedAt: now },
        { upsert: true }
      );
    }

    const token = signAuthToken({ email: user.email, fullName: user.fullName, role });
    const response = NextResponse.json({
      ok: true,
      user: { email: user.email, fullName: user.fullName, role },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
