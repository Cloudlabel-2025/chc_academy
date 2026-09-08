import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";
import VoiceReview from "./voice-review";

export const dynamic = "force-dynamic";

export default async function VoiceReviewPage() {
  const user = await requireAuthUser("/trainer/interviews");
  if (!(await isTrainer(user))) {
    redirect("/dashboard");
  }
  return <VoiceReview />;
}
