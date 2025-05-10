"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusIcon } from "lucide-react";
import LoadingPage from "@/components/LoadingPage";
import TeamMembersTable from "@/components/teams/TeamMembersTable";
import TeamTasksTable from "@/components/teams/TeamTasksTable";

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  content?: string;
  status: string;
  priority: string;
  teamId: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    username: string;
    email: string;
  };
  subtasks: SubTask[];
  createdAt: string;
  dueDate?: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdAt: string;
}

export default function TeamPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("members");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Fetch team details
        const teamResponse = await fetch(`/api/teams/${params.id}`);
        if (!teamResponse.ok) {
          throw new Error("Failed to fetch team");
        }
        const teamData = await teamResponse.json();
        setTeam(teamData.team);

        // Fetch team tasks
        const tasksResponse = await fetch(`/api/teams/${params.id}/tasks`);
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.tasks || []);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
        setError("Failed to load team. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTeamData();
    }
  }, [status, params.id]);

  if (status === "loading") {
    return <LoadingPage message="Verifying your session..." />;
  }

  if (loading) {
    return <LoadingPage message="Loading team details..." />;
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-200 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Team Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The team you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button
            onClick={() => router.push("/dashboard/teams")}
            className="w-full"
          >
            Go Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/teams")}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">{team.name}</h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="mb-6 border-b border-gray-200">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("members")}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === "members"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Team Members
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === "tasks"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Team Tasks
                </button>
              </div>
            </div>

            {activeTab === "members" && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Team Members
                  </h2>
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/teams/${team.id}/invite`)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Invite Member
                  </Button>
                </div>
                <TeamMembersTable
                  members={team.members}
                  teamId={team.id}
                  currentUserRole={
                    team.members.find(
                      (member) => member.userId === session?.user?.id
                    )?.role || "member"
                  }
                  currentUserId={session?.user?.id || ""}
                />
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Team Tasks
                  </h2>
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/tasks/create?team=${team.id}`)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Task
                  </Button>
                </div>

                <TeamTasksTable tasks={tasks} teamId={team.id} />
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => router.push(`/dashboard/teams/${team.id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
