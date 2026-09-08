import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth";
import { isTrainer } from "@/app/trainer-access";
import TrainerRegistration from "./trainer-registration";

export const dynamic = "force-dynamic";

export default async function TrainerRegisterPage() {
  const user = await requireAuthUser("/trainer-register");
  if (await isTrainer(user)) {
    redirect("/trainer");
  }
  return (
    <TrainerRegistration
      name={user.fullName || user.displayName}
      email={user.email}
    />
  );
}
