import { Task, TaskWithRelations } from "../entities/task";

/**
 * Repository interface for Task entity
 * Defines the contract for data access operations
 */
export interface TaskRepository {
  /**
   * Find a task by its ID
   * @param id Task ID
   * @returns Task with relations or null if not found
   */
  findById(id: string): Promise<TaskWithRelations | null>;

  /**
   * Update a task
   * @param id Task ID
   * @param data Task data to update
   * @returns Updated task with relations
   */
  update(id: string, data: Partial<Task>): Promise<TaskWithRelations>;

  /**
   * Delete a task
   * @param id Task ID
   * @returns void
   */
  delete(id: string): Promise<void>;
}
