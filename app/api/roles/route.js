import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserRole } from "@/models/UserRole";
import { getAuthUser } from "@/lib/auth";
import { isAdmin } from "@/app/trainer-access";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const u = await getAuthUser();
  return (await isAdmin(u)) ? u : null;
}

export async function GET() {
  const u = await checkAdmin();
  if (!u) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  await connectToDatabase();
  const roles = await UserRole.find({}).lean();
  return NextResponse.json({ roles });
}

export async function POST(request) {
  const u = await checkAdmin();
  if (!u) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const b = await request.json();
  const email = (b.email || "").trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email) || b.role !== "trainer") {
    return NextResponse.json({ error: "Valid trainer email required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  await connectToDatabase();

  await UserRole.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        role: "trainer",
        grantedBy: u.email,
        grantedAt: now,
        updatedAt: now,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const u = await checkAdmin();
  if (!u) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const email = new URL(request.url).searchParams.get("email")?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  await connectToDatabase();
  await UserRole.deleteOne({ email });
  return NextResponse.json({ ok: true });
}
