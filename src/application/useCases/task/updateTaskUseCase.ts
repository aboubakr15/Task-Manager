import { TaskRepository } from "../../../domain/repositories/taskRepository";
import { TeamRepository } from "../../../domain/repositories/teamRepository";
import {
  TaskUpdateDto,
  TaskUpdateResponseDto,
  ErrorResponseDto,
  TaskUpdateSchema
} from "../../dtos/taskDto";

export interface NotificationService {
  createTaskAssignedNotification(
    userId: string,
    taskId: string,
    taskTitle: string,
    teamName: string
  ): Promise<void>;
}

export class UpdateTaskUseCase {
  constructor(
    private taskRepository: TaskRepository,
    private teamRepository: TeamRepository,
    private notificationService: NotificationService
  ) {}

  /**
   * Execute the use case
   * @param taskId Task ID
   * @param userId Current user ID
   * @param data Task update data
   * @returns Updated task response or error
   */
  async execute(
    taskId: string,
    userId: string,
    data: TaskUpdateDto
  ): Promise<
    | { success: true; data: TaskUpdateResponseDto }
    | { success: false; error: ErrorResponseDto; status: number }
  > {
    try {
      // Validate task data
      const validationResult = TaskUpdateSchema.safeParse(data);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: "Invalid task data",
            errors: validationResult.error.format(),
          },
          status: 400,
        };
      }

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
          error: { message: "You are not authorized to update this task" },
          status: 403,
        };
      }

      // Check if assignment has changed
      const assignmentChanged =
        data.assignedToId !== undefined &&
        data.assignedToId !== task.assignedToId;

      // Update task
      const updatedTask = await this.taskRepository.update(taskId, {
        title: data.title,
        content: data.content,
        status: data.status,
        priority: data.priority,
        teamId: data.teamId,
        assignedToId: data.assignedToId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      });

      // Create notification if task assignment has changed and there is a new assignee
      if (assignmentChanged && data.assignedToId && updatedTask.team) {
        await this.notificationService.createTaskAssignedNotification(
          data.assignedToId,
          taskId,
          updatedTask.title,
          updatedTask.team.name
        );
      }

      return {
        success: true,
        data: {
          message: "Task updated successfully",
          task: updatedTask,
        },
      };
    } catch (error) {
      console.error("Error in UpdateTaskUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }
}
