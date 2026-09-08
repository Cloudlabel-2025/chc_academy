import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";
import ContentConsole from "./content-console";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const user = await requireAuthUser("/trainer/content");
  if (!(await isTrainer(user))) {
    redirect("/trainer-register");
  }
  return <ContentConsole trainerName={user.fullName || user.displayName} />;
}
