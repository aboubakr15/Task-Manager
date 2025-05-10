import { PrismaClient } from "@prisma/client";
import { TeamRepository } from "../../domain/repositories/teamRepository";
import { TeamWithMembers } from "../../domain/entities/team";

/**
 * Prisma implementation of TeamRepository
 */
export class PrismaTeamRepository implements TeamRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Check if a user is a member of a team
   * @param userId User ID
   * @param teamId Team ID
   * @returns TeamMember object with role or null if not a member
   */
  async isTeamMember(
    userId: string,
    teamId: string
  ): Promise<{ role: string } | null> {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        teamId,
      },
      select: {
        role: true,
      },
    });

    return teamMember;
  }

  /**
   * Get all teams for a user
   * @param userId User ID
   * @returns Array of teams with members
   */
  async getUserTeams(userId: string): Promise<TeamWithMembers[]> {
    const teams = await this.prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Add isCurrentUser flag to each team member
    return teams.map((team) => {
      const membersWithFlag = team.members.map((member) => ({
        ...member,
        isCurrentUser: member.userId === userId,
      }));

      return {
        ...team,
        members: membersWithFlag,
      };
    });
  }

  /**
   * Create a new team with the user as admin
   * @param name Team name
   * @param userId User ID of the admin
   * @returns Created team with members
   */
  async createTeam(name: string, userId: string): Promise<TeamWithMembers> {
    return this.prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: "admin",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get a team by ID
   * @param teamId Team ID
   * @returns Team with members or null if not found
   */
  async findById(teamId: string): Promise<TeamWithMembers | null> {
    return this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}
