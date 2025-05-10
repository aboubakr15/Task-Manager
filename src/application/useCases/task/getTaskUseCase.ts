import { TaskRepository } from "../../../domain/repositories/taskRepository";
import { TeamRepository } from "../../../domain/repositories/teamRepository";
import { TaskResponseDto, ErrorResponseDto } from "../../dtos/taskDto";

export class GetTaskUseCase {
  constructor(
    private taskRepository: TaskRepository,
    private teamRepository: TeamRepository
  ) {}

  /**
   * Execute the use case
   * @param taskId Task ID
   * @param userId Current user ID
   * @returns Task response or error
   */
  async execute(
    taskId: string,
    userId: string
  ): Promise<
    | { success: true; data: TaskResponseDto }
    | { success: false; error: ErrorResponseDto; status: number }
  > {
    try {
      // Get task
      const task = await this.taskRepository.findById(taskId);

      if (!task) {
        return {
          success: false,
          error: { message: "Task not found" },
          status: 404,
        };
      }

      // Check if user is a member of the team
      const teamMember = await this.teamRepository.isTeamMember(
        userId,
        task.teamId
      );

      if (!teamMember) {
        return {
          success: false,
          error: { message: "You are not authorized to view this task" },
          status: 403,
        };
      }

      return {
        success: true,
        data: { task },
      };
    } catch (error) {
      console.error("Error in GetTaskUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }
}
