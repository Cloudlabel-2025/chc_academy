import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth";
import { isAdmin } from "@/app/trainer-access";
import RoleManager from "./role-manager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAuthUser("/admin");
  if (!(await isAdmin(user))) {
    redirect("/dashboard");
  }
  return <RoleManager />;
}
