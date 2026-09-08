import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TraineeTimeLog } from "@/models/TraineeTimeLog";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
const isoWeek = /^\d{4}-\d{2}-\d{2}$/;
const minutes = (hours) => Math.min(6000, Math.max(0, Math.round(Number(hours || 0) * 60)));

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await connectToDatabase();
  const logs = await TraineeTimeLog.find({ email: user.email.toLowerCase() }).lean();
  return NextResponse.json({ logs });
}

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const b = await request.json();

  if (!b.taskId || !b.area || !b.weekStart || !isoWeek.test(b.weekStart)) {
    return NextResponse.json({ error: "Task, area and week are required" }, { status: 400 });
  }

  const email = user.email.toLowerCase();
  const row = {
    email,
    taskId: b.taskId.slice(0, 50),
    area: b.area.slice(0, 80),
    weekStart: b.weekStart,
    designMinutes: minutes(b.designHours),
    configurationMinutes: minutes(b.configurationHours),
    uatMinutes: minutes(b.uatHours),
    updatedAt: new Date().toISOString(),
  };

  await connectToDatabase();
  await TraineeTimeLog.findOneAndUpdate(
    { email, taskId: row.taskId, weekStart: row.weekStart },
    {
      $set: {
        area: row.area,
        designMinutes: row.designMinutes,
        configurationMinutes: row.configurationMinutes,
        uatMinutes: row.uatMinutes,
        updatedAt: row.updatedAt,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, row });
}
