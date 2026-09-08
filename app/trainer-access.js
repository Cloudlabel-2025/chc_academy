import { connectToDatabase } from "@/lib/mongodb";
import { UserRole } from "@/models/UserRole";

const OWNER_EMAIL = (process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL || "chcacademy2026@gmail.com").toLowerCase();

export async function getAcademyRole(user) {
  if (!user || !user.email) return "trainee";
  const email = user.email.toLowerCase();
  if (email === OWNER_EMAIL || email === "lavanyabalaji123@gmail.com") return "admin";

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

export async function isTrainer(user) {
  const role = await getAcademyRole(user);
  return role === "admin" || role === "approver" || role === "trainer";
}

export async function isAdmin(user) {
  return (await getAcademyRole(user)) === "admin";
}

export async function canApproveTrainers(user) {
  const role = await getAcademyRole(user);
  return role === "admin" || role === "approver";
}
