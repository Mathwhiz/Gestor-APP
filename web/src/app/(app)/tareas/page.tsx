import { TasksWorkspace } from "@/components/tasks-workspace";
import { getTasksData } from "@/lib/data";

export default async function TasksPage() {
  const tasks = await getTasksData();
  return <TasksWorkspace initialItems={tasks} />;
}
