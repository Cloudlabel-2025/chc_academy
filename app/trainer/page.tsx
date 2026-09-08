import { redirect } from "next/navigation";
import { requireAuthUser, chatGPTSignOutPath } from "@/lib/auth";
import { canApproveTrainers, isAdmin, isTrainer } from "@/app/trainer-access";
import TrainerConsole from "./trainer-console";

export const dynamic = "force-dynamic";

export default async function TrainerPage() {
  const user = await requireAuthUser("/trainer");
  if (!(await isTrainer(user))) {
    redirect("/trainer-register");
  }

  return (
    <TrainerConsole
      trainerName={user.fullName || user.displayName}
      signOut={chatGPTSignOutPath("/")}
      admin={await isAdmin(user)}
      approver={await canApproveTrainers(user)}
    />
  );
}
