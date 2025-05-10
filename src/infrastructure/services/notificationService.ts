import { PrismaClient } from "@prisma/client";
import { NotificationService } from "../../application/useCases/task/updateTaskUseCase";

/**
 * Prisma implementation of NotificationService
 */
export class PrismaNotificationService implements NotificationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a notification for a task assignment
   * @param userId User ID to notify
   * @param taskId Task ID
   * @param taskTitle Task title
   * @param teamName Team name
   */
  async createTaskAssignedNotification(
    userId: string,
    taskId: string,
    taskTitle: string,
    teamName: string
  ): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          type: "task_assigned",
          message: `You have been assigned to task "${taskTitle}" in team "${teamName}"`,
          userId: userId,
          taskId: taskId,
        },
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }
}
