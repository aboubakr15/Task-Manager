import { PrismaClient } from "@prisma/client";
import { Task, TaskWithRelations } from "../../domain/entities/task";
import { TaskRepository } from "../../domain/repositories/taskRepository";

/**
 * Prisma implementation of TaskRepository
 */
export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find a task by its ID
   * @param id Task ID
   * @returns Task with relations or null if not found
   */
  async findById(id: string): Promise<TaskWithRelations | null> {
    const task = await this.prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        subtasks: true,
        attachments: true,
        team: true,
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return task as unknown as TaskWithRelations;
  }

  /**
   * Update a task
   * @param id Task ID
   * @param data Task data to update
   * @returns Updated task with relations
   */
  async update(id: string, data: Partial<Task>): Promise<TaskWithRelations> {
    const updatedTask = await this.prisma.task.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        content: data.content,
        status: data.status,
        priority: data.priority,
        teamId: data.teamId,
        assignedToId: data.assignedToId,
        dueDate: data.dueDate,
      },
      include: {
        subtasks: true,
        attachments: true,
        team: true,
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return updatedTask as unknown as TaskWithRelations;
  }

  /**
   * Delete a task
   * @param id Task ID
   * @returns void
   */
  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: {
        id,
      },
    });
  }
}
