"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Dropdown menu imports removed
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface TeamTasksTableProps {
  tasks: Task[];
  teamId?: string;
  isTeamAdmin?: boolean; // Add prop to indicate if user is team admin
}

export default function TeamTasksTable({
  tasks,
  isTeamAdmin = false,
}: TeamTasksTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const openDeleteDialog = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "done":
        return "Completed";
      default:
        return status;
    }
  };

  // This function is no longer used as we're using inline styles in the JSX
  // Keeping it commented for reference
  /*
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 px-2 py-0.5 rounded-full";
      case "medium":
        return "text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full";
      case "low":
        return "text-green-600 bg-green-50 px-2 py-0.5 rounded-full";
      default:
        return "text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full";
    }
  };
  */

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100">
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <Clock className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No tasks found for this team</p>
                    <p className="text-sm text-gray-400">
                      Create a task to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="group cursor-pointer hover:bg-blue-50"
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        {getStatusIcon(task.status)}
                      </div>
                      <span
                        className="truncate max-w-[250px]"
                        title={task.title}
                      >
                        {task.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          task.status === "todo"
                            ? "bg-gray-100 text-gray-800"
                            : task.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {getStatusText(task.status)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          task.priority === "high"
                            ? "bg-red-600"
                            : task.priority === "medium"
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                      ></span>
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.assignedTo ? (
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-700 text-xs font-semibold">
                          {task.assignedTo.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{task.assignedTo.username}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`${
                        !task.dueDate ? "text-gray-500 italic" : ""
                      }`}
                    >
                      {formatDate(task.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isTeamAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          openDeleteDialog(task);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{taskToDelete?.title}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
