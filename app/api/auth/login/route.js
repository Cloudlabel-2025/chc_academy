import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { UserRole } from "@/models/UserRole";
import { comparePassword, signAuthToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
const OWNER_EMAIL = (process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL || "chcacademy2026@gmail.com").toLowerCase();

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Resolve accurate role
    let role = user.role || "trainee";
    if (email === OWNER_EMAIL || email === "lavanyabalaji123@gmail.com") {
      role = "admin";
    } else {
      const roleRecord = await UserRole.findOne({ email }).lean();
      if (roleRecord?.role) {
        role = roleRecord.role;
      }
    }

    const token = signAuthToken({ email: user.email, fullName: user.fullName, role });
    const response = NextResponse.json({
      ok: true,
      user: { email: user.email, fullName: user.fullName, role },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
