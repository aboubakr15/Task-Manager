import { TeamRepository } from "../../../domain/repositories/teamRepository";
import {
  TeamCreateDto,
  TeamResponseDto,
  ErrorResponseDto,
  TeamCreateSchema,
} from "../../dtos/teamDto";

export class CreateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  /**
   * Execute the use case
   * @param userId User ID
   * @param data Team creation data
   * @returns Team response or error
   */
  async execute(
    userId: string,
    data: TeamCreateDto
  ): Promise<
    | { success: true; data: TeamResponseDto; status: number }
    | { success: false; error: ErrorResponseDto; status: number }
  > {
    try {
      // Validate team data
      const validationResult = TeamCreateSchema.safeParse(data);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: "Invalid team data",
            errors: validationResult.error.format(),
          },
          status: 400,
        };
      }

      // Create team
      const team = await this.teamRepository.createTeam(data.name, userId);

      return {
        success: true,
        data: {
          team,
          message: "Team created successfully",
        },
        status: 201,
      };
    } catch (error) {
      console.error("Error in CreateTeamUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }
}
