import { Team, TeamWithMembers } from "../entities/team";

/**
 * Repository interface for Team entity
 * Defines the contract for team-related data access operations
 */
export interface TeamRepository {
  /**
   * Check if a user is a member of a team
   * @param userId User ID
   * @param teamId Team ID
   * @returns TeamMember object with role or null if not a member
   */
  isTeamMember(userId: string, teamId: string): Promise<{ role: string } | null>;

  /**
   * Get all teams for a user
   * @param userId User ID
   * @returns Array of teams with members
   */
  getUserTeams(userId: string): Promise<TeamWithMembers[]>;

  /**
   * Create a new team with the user as admin
   * @param name Team name
   * @param userId User ID of the admin
   * @returns Created team with members
   */
  createTeam(name: string, userId: string): Promise<TeamWithMembers>;

  /**
   * Get a team by ID
   * @param teamId Team ID
   * @returns Team with members or null if not found
   */
  findById(teamId: string): Promise<TeamWithMembers | null>;
}
