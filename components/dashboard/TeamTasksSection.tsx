"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import TaskCard from "@/components/tasks/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";

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

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
}

interface TeamTasksSectionProps {
  teamId: string;
  teamName: string;
  tasks: Task[];
  isAdmin: boolean;
}

export default function TeamTasksSection({
  teamId,
  teamName,
  tasks,
  isAdmin,
}: TeamTasksSectionProps) {
  const router = useRouter();

  if (tasks.length === 0) {
    return null; // Don't show empty team sections
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{teamName}</h2>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/teams/${teamId}/tasks/create`)
            }
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} isTeamAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}

export function TeamTasksSectionSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
