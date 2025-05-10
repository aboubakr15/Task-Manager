import { hash } from "bcrypt";
import { UserRepository } from "../../../domain/repositories/userRepository";
import {
  UserRegistrationDto,
  UserRegistrationResponseDto,
  ErrorResponseDto,
  UserRegistrationSchema,
} from "../../dtos/userDto";

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * Execute the use case
   * @param data User registration data
   * @returns Registration response or error
   */
  async execute(
    data: UserRegistrationDto
  ): Promise<
    | { success: true; data: UserRegistrationResponseDto; status: number }
    | { success: false; error: ErrorResponseDto; status: number }
  > {
    try {
      // Validate user data
      const validationResult = UserRegistrationSchema.safeParse(data);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: "Invalid user data",
            errors: validationResult.error.format(),
          },
          status: 400,
        };
      }

      // Check if user with this email already exists
      const existingUserByEmail = await this.userRepository.findByEmail(
        data.email
      );

      if (existingUserByEmail) {
        return {
          success: false,
          error: { message: "User with this email already exists" },
          status: 409,
        };
      }

      // Check if user with this username already exists
      const existingUserByUsername = await this.userRepository.findByUsername(
        data.username
      );

      if (existingUserByUsername) {
        return {
          success: false,
          error: { message: "Username is already taken" },
          status: 409,
        };
      }

      // Hash password
      const hashedPassword = await hash(data.password, 10);

      // Create user
      const user = await this.userRepository.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          message: "User registered successfully",
        },
        status: 201,
      };
    } catch (error) {
      console.error("Error in RegisterUserUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }
}
