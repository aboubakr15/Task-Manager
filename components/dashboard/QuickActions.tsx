"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Users, 
  CheckSquare, 
  UserPlus,
  Calendar,
  Settings
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  members: Array<{
    id: string;
    userId: string;
    role: string;
  }>;
}

interface QuickActionsProps {
  teams: Team[];
  hasAdminTeams: boolean;
}

export default function QuickActions({ teams, hasAdminTeams }: QuickActionsProps) {
  const router = useRouter();
  
  // Get the first team where the user is an admin (if any)
  const firstAdminTeam = teams.find(team => 
    team.members.some(member => member.role === "admin")
  );
  
  return (
    <Card className="border border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {hasAdminTeams && (
            <Button 
              variant="outline" 
              className="h-auto py-4 px-4 border-blue-200 hover:bg-blue-50 flex flex-col items-center justify-center text-blue-700"
              onClick={() => router.push(firstAdminTeam 
                ? `/dashboard/teams/${firstAdminTeam.id}/tasks/create` 
                : "/dashboard/teams")}
            >
              <PlusCircle className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Create Task</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="h-auto py-4 px-4 border-blue-200 hover:bg-blue-50 flex flex-col items-center justify-center text-blue-700"
            onClick={() => router.push("/dashboard/teams/create")}
          >
            <Users className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Create Team</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 px-4 border-blue-200 hover:bg-blue-50 flex flex-col items-center justify-center text-blue-700"
            onClick={() => router.push("/dashboard/tasks")}
          >
            <CheckSquare className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">View Tasks</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 px-4 border-blue-200 hover:bg-blue-50 flex flex-col items-center justify-center text-blue-700"
            onClick={() => router.push("/dashboard/teams")}
          >
            <UserPlus className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Manage Teams</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
