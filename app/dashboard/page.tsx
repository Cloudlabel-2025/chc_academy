import { requireAuthUser, chatGPTSignOutPath } from "@/lib/auth";
import TraineeDashboard from "./trainee-dashboard";
import { isTrainer } from "@/app/trainer-access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuthUser("/dashboard");
  const trainer = await isTrainer(user);
  return (
    <TraineeDashboard
      user={user}
      signOut={chatGPTSignOutPath("/")}
      trainer={trainer}
    />
  );
}
