import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth";
import { canApproveTrainers } from "@/app/trainer-access";
import TrainerApprovals from "./trainer-approvals";

export const dynamic = "force-dynamic";

export default async function TrainerApprovalsPage() {
  const user = await requireAuthUser("/trainer-approvals");
  if (!(await canApproveTrainers(user))) {
    redirect("/dashboard");
  }
  return <TrainerApprovals approverName={user.fullName || user.displayName} />;
}
