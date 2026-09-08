import { requireAuthUser, chatGPTSignOutPath } from "@/lib/auth";
import TaskWorkspace from "./workspace";

export const dynamic = "force-dynamic";

export default async function TaskWorkspacePage() {
  await requireAuthUser("/task-workspace");
  return <TaskWorkspace signOut={chatGPTSignOutPath("/")} />;
}
