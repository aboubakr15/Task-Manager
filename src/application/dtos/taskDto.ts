import { z } from "zod";
import { Task, TaskWithRelations } from "../../domain/entities/task";

/**
 * Data Transfer Objects for Task entity
 */

// Schema for task update validation
export const TaskUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  content: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  teamId: z.string().optional(),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export type TaskUpdateDto = z.infer<typeof TaskUpdateSchema>;

// Response DTOs
export interface TaskResponseDto {
  task: TaskWithRelations;
}

export interface TaskUpdateResponseDto {
  message: string;
  task: TaskWithRelations;
}

export interface TaskDeleteResponseDto {
  message: string;
}

export interface ErrorResponseDto {
  message: string;
  errors?: any;
}
