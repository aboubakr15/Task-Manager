"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface TaskStatisticsProps {
  tasks: Task[];
}

export default function TaskStatistics({ tasks }: TaskStatisticsProps) {
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const newStats = {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      high: tasks.filter((task) => task.priority === "high").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      low: tasks.filter((task) => task.priority === "low").length,
    };

    setStats(newStats);
  }, [tasks]);

  const getPercentage = (value: number) => {
    if (stats.total === 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  return (
    <Card className="border border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Task Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium">To Do</span>
              </div>
              <span className="text-sm text-gray-500">
                {stats.todo} of {stats.total} ({getPercentage(stats.todo)}%)
              </span>
            </div>
            <Progress
              value={getPercentage(stats.todo)}
              className="h-2 bg-blue-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <span className="text-sm text-gray-500">
                {stats.inProgress} of {stats.total} ({getPercentage(stats.inProgress)}%)
              </span>
            </div>
            <Progress
              value={getPercentage(stats.inProgress)}
              className="h-2 bg-yellow-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm text-gray-500">
                {stats.completed} of {stats.total} ({getPercentage(stats.completed)}%)
              </span>
            </div>
            <Progress
              value={getPercentage(stats.completed)}
              className="h-2 bg-green-100"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-sm font-medium mb-2">By Priority</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 p-2 rounded-md text-center">
                <div className="text-sm font-semibold text-red-700">{stats.high}</div>
                <div className="text-xs text-gray-500">High</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded-md text-center">
                <div className="text-sm font-semibold text-yellow-700">{stats.medium}</div>
                <div className="text-xs text-gray-500">Medium</div>
              </div>
              <div className="bg-green-50 p-2 rounded-md text-center">
                <div className="text-sm font-semibold text-green-700">{stats.low}</div>
                <div className="text-xs text-gray-500">Low</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
