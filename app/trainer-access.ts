import { connectToDatabase } from "../lib/mongodb";
import { UserRole } from "../models/UserRole";
import type { AuthUser } from "../lib/auth";

export type AcademyRole = "admin" | "approver" | "trainer" | "trainee";
const OWNER_EMAIL = (process.env.ADMIN_EMAIL || "lavanyabalaji123@gmail.com").toLowerCase();

export async function getAcademyRole(user: AuthUser | null): Promise<AcademyRole> {
  if (!user || !user.email) return "trainee";
  const email = user.email.toLowerCase();
  if (email === OWNER_EMAIL) return "admin";

  try {
    await connectToDatabase();
    const record = await UserRole.findOne({ email }).lean();
    if (record?.role === "admin") return "admin";
    if (record?.role === "approver") return "approver";
    if (record?.role === "trainer") return "trainer";
    return "trainee";
  } catch {
    return "trainee";
  }
}

export async function isTrainer(user: AuthUser | null): Promise<boolean> {
  const role = await getAcademyRole(user);
  return role === "admin" || role === "approver" || role === "trainer";
}

export async function isAdmin(user: AuthUser | null): Promise<boolean> {
  return (await getAcademyRole(user)) === "admin";
}

export async function canApproveTrainers(user: AuthUser | null): Promise<boolean> {
  const role = await getAcademyRole(user);
  return role === "admin" || role === "approver";
}
