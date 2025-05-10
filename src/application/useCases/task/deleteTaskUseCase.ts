import { TaskRepository } from "../../../domain/repositories/taskRepository";
import { TeamRepository } from "../../../domain/repositories/teamRepository";
import { TaskDeleteResponseDto, ErrorResponseDto } from "../../dtos/taskDto";

export class DeleteTaskUseCase {
  constructor(
    private taskRepository: TaskRepository,
    private teamRepository: TeamRepository
  ) {}

  /**
   * Execute the use case
   * @param taskId Task ID
   * @param userId Current user ID
   * @returns Success message or error
   */
  async execute(
    taskId: string,
    userId: string
  ): Promise<
    | { success: true; data: TaskDeleteResponseDto }
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

      // Check if user is an admin of the team
      const teamMember = await this.teamRepository.isTeamMember(
        userId,
        task.teamId
      );

      if (!teamMember || teamMember.role !== "admin") {
        return {
          success: false,
          error: { message: "Only team admins can delete tasks" },
          status: 403,
        };
      }

      // Delete task
      await this.taskRepository.delete(taskId);

      return {
        success: true,
        data: {
          message: "Task deleted successfully",
        },
      };
    } catch (error) {
      console.error("Error in DeleteTaskUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }
}
