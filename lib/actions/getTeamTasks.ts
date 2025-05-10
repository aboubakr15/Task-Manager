import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function getTeamTasks(teamId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return [];

  // Check if user is a member of the team
  const teamMember = await db.teamMember.findFirst({
    where: {
      userId: session.user.id,
      teamId,
    },
  });

  if (!teamMember) return [];

  // Get tasks for the team
  const tasks = await db.task.findMany({
    where: {
      teamId,
    },
    include: {
      subtasks: true,
      assignedTo: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
}
