import { TasksWorkspace } from "@/components/tasks-workspace";
import { canEditRole, requireAuthenticatedAppUser } from "@/lib/auth";
import { getTasksData } from "@/lib/data";

export default async function TasksPage() {
  const { profile } = await requireAuthenticatedAppUser();
  const tasks = await getTasksData({ includeArchived: true });
  return <TasksWorkspace initialItems={tasks} canEdit={canEditRole(profile.role)} />;
}
