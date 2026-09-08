import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAcademyRole } from "@/app/trainer-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const role = await getAcademyRole(user);
  return NextResponse.json({
    user: {
      email: user.email,
      fullName: user.fullName,
      displayName: user.displayName,
      role,
    },
  });
}
