import { z } from "zod";

/**
 * Username validation schema
 * - Must be between 3 and 20 characters
 * - Can only contain alphanumeric characters, underscores, and hyphens
 * - Must start with a letter
 */
export const usernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters" })
  .max(20, { message: "Username must be at most 20 characters" })
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
    message:
      "Username must start with a letter and can only contain letters, numbers, underscores, and hyphens",
  });

/**
 * Email validation schema
 * - Must be a valid email format
 */
export const emailSchema = z
  .string()
  .email({ message: "Please enter a valid email address" });

/**
 * Password validation schema
 * - Must be at least 8 characters
 * - Must contain at least one uppercase letter
 * - Must contain at least one lowercase letter
 * - Must contain at least one number
 */
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
