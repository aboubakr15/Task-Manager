"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  CheckSquare,
  Paperclip,
  CheckCircle2 as CheckCircle2Icon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
// Alert dialog imports removed
import LoadingPage from "@/components/LoadingPage";
import AttachmentList from "@/components/tasks/AttachmentList";

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Task {
  id: string;
  title: string;
  content?: string;
  status: string;
  priority: string;
  teamId: string;
  team: {
    id: string;
    name: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    username: string;
    email: string;
  };
  subtasks: SubTask[];
  attachments: Attachment[];
  createdAt: string;
  dueDate?: string;
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const taskId = params.id; // Extract ID once to avoid repeated access
  const { status } = useSession();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // No longer need delete dialog state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task");
        }
        const data = await response.json();
        setTask(data.task);
      } catch (error) {
        console.error("Error fetching task:", error);
        setError("Failed to load task. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTask();
    }
  }, [status, taskId]);

  // No longer need delete functionality

  const updateTaskStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Update local state
      setTask((prevTask) => {
        if (!prevTask) return null;
        return {
          ...prevTask,
          status,
        };
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status. Please try again later.");
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, completed: boolean) => {
    try {
      const response = await fetch(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update subtask");
      }

      // Update local state
      setTask((prevTask) => {
        if (!prevTask) return null;
        return {
          ...prevTask,
          subtasks: prevTask.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed } : st
          ),
        };
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const calculateProgress = () => {
    if (!task || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter((st) => st.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  if (status === "loading") {
    return <LoadingPage message="Verifying your session..." />;
  }

  if (loading) {
    return <LoadingPage message="Loading task details..." />;
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard/tasks")}
                  className="mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-800">
                  Task Not Found
                </h1>
              </div>
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg">
                {error || "The requested task could not be found."}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard/tasks")}
                  className="mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-800">
                  {task.title}
                </h1>
              </div>
              <div className="flex space-x-2">
                {task.status !== "in-progress" && (
                  <Button
                    variant="outline"
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                    onClick={() => updateTaskStatus("in-progress")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as In Progress
                  </Button>
                )}
                {task.status !== "completed" && (
                  <Button
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    onClick={() => updateTaskStatus("completed")}
                  >
                    <CheckCircle2Icon className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
                {task.status !== "todo" && (
                  <Button
                    variant="outline"
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                    onClick={() => updateTaskStatus("todo")}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Mark as To Do
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge
                variant="outline"
                className={getPriorityColor(task.priority)}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
                Priority
              </Badge>
              <Badge variant="outline" className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Created
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(task.createdAt), "PPP")}
                      </div>
                    </div>
                  </div>

                  {task.dueDate && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Due Date
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(task.dueDate), "PPP")}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Assigned To
                      </div>
                      <div className="text-sm text-gray-600">
                        {task.assignedTo
                          ? task.assignedTo.username
                          : "Unassigned"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Team
                </h2>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-sm font-medium text-gray-700">
                    {task.team.name}
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600"
                    onClick={() =>
                      router.push(`/dashboard/teams/${task.teamId}`)
                    }
                  >
                    View Team
                  </Button>
                </div>
              </div>
            </div>

            {task.content && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Description
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.content}
                  </p>
                </div>
              </div>
            )}

            {task.subtasks.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Subtasks
                  </h2>
                  <div className="text-sm text-gray-600">
                    {task.subtasks.filter((st) => st.completed).length}/
                    {task.subtasks.length} completed
                  </div>
                </div>
                <Progress value={calculateProgress()} className="h-2 mb-4" />
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <Checkbox
                        id={subtask.id}
                        checked={subtask.completed}
                        onCheckedChange={(checked) =>
                          updateSubtaskStatus(subtask.id, checked === true)
                        }
                        className="mr-3"
                      />
                      <label
                        htmlFor={subtask.id}
                        className={`text-sm ${
                          subtask.completed
                            ? "line-through text-gray-500"
                            : "text-gray-700"
                        }`}
                      >
                        {subtask.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <div className="flex items-center">
                  <Paperclip className="h-5 w-5 mr-2" />
                  Attachments
                </div>
              </h2>
              <AttachmentList attachments={task.attachments} />
            </div>
          </div>
        </div>
      </div>

      {/* Alert dialog removed */}
    </div>
  );
}
