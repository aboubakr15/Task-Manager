import { z } from "zod";
import { UserWithoutPassword } from "../../domain/entities/user";

/**
 * Data Transfer Objects for User entity
 */

// Schema for user registration validation
export const UserRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserRegistrationDto = z.infer<typeof UserRegistrationSchema>;

// Response DTOs
export interface UserRegistrationResponseDto {
  user: UserWithoutPassword;
  message: string;
}

export interface ErrorResponseDto {
  message: string;
  errors?: any;
}
