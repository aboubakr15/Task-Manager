"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/LoadingPage";
import RecentTasks from "@/components/dashboard/RecentTasks";
import TeamOverview from "@/components/dashboard/TeamOverview";

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
  members: Array<{
    id: string;
    userId: string;
    role: string;
    isCurrentUser?: boolean;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks");
        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasksData = await tasksResponse.json();

        // Fetch teams
        const teamsResponse = await fetch("/api/teams");
        if (!teamsResponse.ok) {
          throw new Error("Failed to fetch teams");
        }
        const teamsData = await teamsResponse.json();

        setTasks(tasksData.tasks || []);
        setTeams(teamsData.teams || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  // We're not using this anymore since we removed QuickActions
  // const hasAdminTeams = teams.some((team) =>
  //   team.members.some(
  //     (member) => member.isCurrentUser && member.role === "admin"
  //   )
  // );

  if (status === "loading" || loading) {
    return <LoadingPage message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome, {session?.user?.name || "User"}!
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentTasks tasks={tasks} />
              <TeamOverview teams={teams} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
