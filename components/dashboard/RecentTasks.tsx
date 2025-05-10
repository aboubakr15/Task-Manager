"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  teamId: string;
  team?: {
    id: string;
    name: string;
  };
  createdAt: string;
  dueDate?: string;
}

interface RecentTasksProps {
  tasks: Task[];
}

export default function RecentTasks({ tasks }: RecentTasksProps) {
  const router = useRouter();
  
  // Get the 5 most recent tasks
  const recentTasks = tasks.slice(0, 5);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      default:
        return "To Do";
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  
  return (
    <Card className="border border-blue-100">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Recent Tasks
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600 hover:text-blue-800"
          onClick={() => router.push("/dashboard/tasks")}
        >
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {recentTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No tasks found. Create your first task to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div 
                key={task.id} 
                className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1 truncate">{task.title}</div>
                    <div className="flex items-center text-sm text-gray-500 space-x-3">
                      {task.team && (
                        <span className="truncate max-w-[120px]">{task.team.name}</span>
                      )}
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(task.status)}
                      <span className="text-xs">{getStatusText(task.status)}</span>
                    </div>
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
