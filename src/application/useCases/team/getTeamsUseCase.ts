import { TeamRepository } from "../../../domain/repositories/teamRepository";
import { TeamsResponseDto, ErrorResponseDto } from "../../dtos/teamDto";

export class GetTeamsUseCase {
  constructor(private teamRepository: TeamRepository) {}

  /**
   * Execute the use case
   * @param userId User ID
   * @returns Teams response or error
   */
  async execute(
    userId: string
  ): Promise<
    | { success: true; data: TeamsResponseDto }
    | { success: false; error: ErrorResponseDto; status: number }
  > {
    try {
      // Get user's teams
      const teams = await this.teamRepository.getUserTeams(userId);

      return {
        success: true,
        data: { teams },
      };
    } catch (error) {
      console.error("Error in GetTeamsUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }
}
