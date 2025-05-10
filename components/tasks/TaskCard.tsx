"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2Icon,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  CheckSquare,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  assignedToId?: string;
  teamId: string;
  createdAt: string;
  dueDate?: string;
  subtasks: SubTask[];
}

interface TaskCardProps {
  task: Task;
  isTeamAdmin?: boolean; // Add prop to indicate if user is team admin
}

export default function TaskCard({ task, isTeamAdmin = false }: TaskCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2Icon className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "todo":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "done":
        return "Done";
      case "in-progress":
        return "In Progress";
      case "todo":
        return "To Do";
      default:
        return status;
    }
  };

  const calculateProgress = () => {
    if (task.subtasks.length === 0) return 0;
    const completedCount = task.subtasks.filter((st) => st.completed).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete task");
        }

        router.refresh();
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card
      className="border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
            {task.title}
          </CardTitle>
          {isTeamAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click event
                handleDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {task.content && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {task.content}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
            Priority
          </Badge>

          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
          >
            {getStatusIcon(task.status)}
            {getStatusText(task.status)}
          </Badge>
        </div>

        {task.subtasks.length > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                Subtasks
              </span>
              <span>
                {task.subtasks.filter((st) => st.completed).length}/
                {task.subtasks.length}
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-1.5" />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 text-xs text-gray-500">
        {task.createdAt && (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Created{" "}
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
