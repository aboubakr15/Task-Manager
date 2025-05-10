import { z } from "zod";
import { TeamWithMembers } from "../../domain/entities/team";

/**
 * Data Transfer Objects for Team entity
 */

// Schema for team creation validation
export const TeamCreateSchema = z.object({
  name: z.string().min(1, "Team name is required"),
});

export type TeamCreateDto = z.infer<typeof TeamCreateSchema>;

// Response DTOs
export interface TeamsResponseDto {
  teams: TeamWithMembers[];
}

export interface TeamResponseDto {
  team: TeamWithMembers;
  message: string;
}

export interface ErrorResponseDto {
  message: string;
  errors?: any;
}
