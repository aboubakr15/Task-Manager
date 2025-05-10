"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingPage from "@/components/LoadingPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamTasksSection, {
  TeamTasksSectionSkeleton,
} from "@/components/dashboard/TeamTasksSection";

interface Task {
  id: string;
  title: string;
  content?: string;
  status: string;
  priority: string;
  assignedToId?: string;
  teamId: string;
  createdAt: string;
  dueDate?: string;
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  team?: {
    id: string;
    name: string;
  };
}

interface Team {
  id: string;
  name: string;
  isAdmin: boolean;
}

export default function TasksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks");
        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasksData = await tasksResponse.json();

        // Fetch teams to get admin status, get user's teams
        const teamsResponse = await fetch("/api/teams");
        if (!teamsResponse.ok) {
          throw new Error("Failed to fetch teams");
        }
        const teamsData = await teamsResponse.json();

        // Create a map of teamId -> isAdmin status
        const teamAdminMap = new Map<
          string,
          { name: string; isAdmin: boolean }
        >();
        teamsData.teams.forEach(
          (team: {
            id: string;
            name: string;
            members: Array<{ role: string; isCurrentUser: boolean }>;
          }) => {
            teamAdminMap.set(team.id, {
              name: team.name,
              isAdmin: team.members.some(
                (member: { role: string; isCurrentUser: boolean }) =>
                  member.role === "admin" && member.isCurrentUser
              ),
            });
          }
        );

        // Create teams array with admin status
        const teamsWithAdminStatus = Array.from(teamAdminMap.entries()).map(
          ([id, { name, isAdmin }]) => ({
            id,
            name,
            isAdmin,
          })
        );

        setTasks(tasksData.tasks);
        setTeams(teamsWithAdminStatus);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  if (status === "loading") {
    return <LoadingPage message="Verifying your session..." />;
  }

  if (loading) {
    return <LoadingPage message="Loading your tasks..." />;
  }

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  // Group tasks by team
  const tasksByTeam = filteredTasks.reduce((acc, task) => {
    const teamId = task.teamId;
    if (!acc[teamId]) {
      acc[teamId] = [];
    }
    acc[teamId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-4"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="todo">To Do</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div>
                    <TeamTasksSectionSkeleton />
                    <TeamTasksSectionSkeleton />
                  </div>
                ) : Object.keys(tasksByTeam).length === 0 ? (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-gray-600">
                      You have no tasks assigned to you in this category.
                    </p>
                  </div>
                ) : (
                  <div>
                    {Object.entries(tasksByTeam).map(([teamId, teamTasks]) => {
                      const team = teams.find((t) => t.id === teamId);
                      if (!team) return null;

                      return (
                        <TeamTasksSection
                          key={teamId}
                          teamId={teamId}
                          teamName={team.name}
                          tasks={teamTasks}
                          isAdmin={team.isAdmin}
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
