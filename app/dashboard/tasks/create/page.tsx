"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import LoadingPage from "@/components/LoadingPage";
import SubTaskInput from "@/components/tasks/SubTaskInput";
import AttachmentUpload from "@/components/tasks/AttachmentUpload";

interface Team {
  id: string;
  name: string;
  isAdmin: boolean; // Add isAdmin flag to track admin status
}

interface TeamMember {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().optional(),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  teamId: z.string().min(1, "Team is required"),
  assignedToId: z.string().optional(),
  dueDate: z.date().optional(),
});

// We'll use the inferred type from the form

// We're using a custom type definition instead of z.infer

export default function CreateTaskPage() {
  const { status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [subtasks, setSubtasks] = useState<{ id: string; title: string }[]>([]);
  const [attachments, setAttachments] = useState<{ id: string; file: File }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use any type to avoid TypeScript errors with the resolver
  const form = useForm({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues: {
      title: "",
      content: "",
      status: "todo",
      priority: "medium",
      teamId: "",
      assignedToId: "",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();

        // Log the raw data to understand its structure
        console.log(
          "Teams data received (raw):",
          JSON.stringify(data, null, 2)
        );

        // Process all teams and check for admin status
        const teamsWithAdminStatus = data.teams.map((team: any) => {
          console.log(`Processing team: ${team.name} (${team.id})`);

          // Find members with isCurrentUser flag
          const currentUserMembers = team.members.filter(
            (member: any) =>
              member.isCurrentUser === true || member.userId === member.user?.id
          );

          console.log(
            `Current user members found:`,
            JSON.stringify(currentUserMembers, null, 2)
          );

          // Check if any of the current user's memberships have admin role
          const isAdmin = currentUserMembers.some(
            (member: any) => member.role === "admin"
          );

          console.log(
            `Team ${team.name} (${team.id}): User is admin: ${isAdmin}`
          );

          return {
            id: team.id,
            name: team.name,
            isAdmin: isAdmin,
          };
        });

        // For debugging, show all teams
        console.log(
          "All teams with admin status:",
          JSON.stringify(teamsWithAdminStatus, null, 2)
        );

        // Only show teams where the user is an admin
        const adminTeams = teamsWithAdminStatus.filter((team: Team) => {
          console.log(`Filtering team ${team.name}: isAdmin = ${team.isAdmin}`);
          return team.isAdmin === true;
        });

        console.log("Admin teams:", adminTeams);

        if (adminTeams.length === 0) {
          console.warn("No teams found where user is admin");
          setError(
            "You must be a team admin to create tasks. Please contact your team admin."
          );
        }

        // Set all teams for now to debug the issue
        setTeams(adminTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setError("Failed to load teams. Please try again later.");
      }
    };

    if (status === "authenticated") {
      fetchTeams();
    }
  }, [status]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedTeam) return;

      try {
        const response = await fetch(`/api/teams/${selectedTeam}/members`);
        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }
        const data = await response.json();
        setTeamMembers(data.members);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    if (selectedTeam) {
      fetchTeamMembers();
    }
  }, [selectedTeam]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    setError("");

    try {
      console.log(
        "Starting task creation with attachments:",
        attachments.length
      );

      // Create FormData for file uploads
      const formData = new FormData();

      // Add task data
      const taskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        subtasks: subtasks.map((st) => ({ title: st.title })),
      };

      console.log("Task data:", JSON.stringify(taskData));
      formData.append("taskData", JSON.stringify(taskData));

      // Add attachments
      if (attachments.length > 0) {
        console.log(`Adding ${attachments.length} attachments to form data`);
        attachments.forEach((attachment, index) => {
          console.log(
            `Adding attachment ${index}: ${attachment.file.name} (${attachment.file.size} bytes)`
          );
          formData.append(`attachment_${index}`, attachment.file);
        });
      }

      console.log("Sending request to /api/tasks");
      const response = await fetch("/api/tasks", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      router.push("/dashboard/tasks");
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <LoadingPage message="Verifying your session..." />;
  }

  // Only redirect if we've finished loading teams and found none where user is admin
  useEffect(() => {
    // Create a flag to track if we've attempted to load teams
    const teamsAttemptedToLoad =
      teams.length === 0 && !loading && status === "authenticated";

    // Create a variable to store the timeout ID
    let redirectTimeout: NodeJS.Timeout;

    if (teamsAttemptedToLoad) {
      // Add a delay to ensure we don't redirect prematurely
      redirectTimeout = setTimeout(() => {
        console.log("No admin teams found, redirecting to tasks page");
        router.push("/dashboard/tasks");
      }, 2000); // 2 second delay
    }

    // Clean up the timeout if the component unmounts or dependencies change
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [teams, loading, status, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">Create Task</h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Task title"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm font-medium text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="content"
                  placeholder="Task description"
                  className="min-h-[100px]"
                  {...form.register("content")}
                />
                {form.formState.errors.content && (
                  <p className="text-sm font-medium text-red-500">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("priority")}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {form.formState.errors.priority && (
                    <p className="text-sm font-medium text-red-500">
                      {form.formState.errors.priority.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("status")}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  {form.formState.errors.status && (
                    <p className="text-sm font-medium text-red-500">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="teamId" className="text-sm font-medium">
                    Team
                  </label>
                  <select
                    id="teamId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("teamId")}
                    onChange={(e) => {
                      form.setValue("teamId", e.target.value);
                      setSelectedTeam(e.target.value);
                    }}
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.teamId && (
                    <p className="text-sm font-medium text-red-500">
                      {form.formState.errors.teamId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="assignedToId" className="text-sm font-medium">
                    Assigned To
                  </label>
                  <select
                    id="assignedToId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("assignedToId")}
                    disabled={!selectedTeam}
                  >
                    <option value="">
                      {selectedTeam ? "Unassigned" : "Select a team first"}
                    </option>
                    {teamMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.user.username || member.user.email}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.assignedToId && (
                    <p className="text-sm font-medium text-red-500">
                      {form.formState.errors.assignedToId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subtasks</label>
                <SubTaskInput subtasks={subtasks} setSubtasks={setSubtasks} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments</label>
                <AttachmentUpload
                  attachments={attachments}
                  setAttachments={setAttachments}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Task
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
