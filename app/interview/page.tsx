import { requireAuthUser, chatGPTSignOutPath } from "@/lib/auth";
import InterviewSimulator from "./simulator";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const user = await requireAuthUser("/interview");
  return (
    <InterviewSimulator
      name={user.fullName || user.displayName}
      signOut={chatGPTSignOutPath("/")}
    />
  );
}
