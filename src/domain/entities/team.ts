import { User } from "./user";

/**
 * Team entity representing the core business object
 */
export interface Team {
  id: string;
  name: string;
  createdAt: Date;
}

/**
 * TeamMember entity representing the relationship between a user and a team
 */
export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string; // "admin" or "member"
  user?: {
    id: string;
    username?: string | null;
    email: string;
  };
  isCurrentUser?: boolean;
}

/**
 * Team with related entities
 */
export interface TeamWithMembers extends Team {
  members: TeamMember[];
}
