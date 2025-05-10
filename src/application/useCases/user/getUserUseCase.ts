import { UserRepository } from "../../../domain/repositories/userRepository";
import { ErrorResponseDto } from "../../dtos/userDto";
import { UserWithoutPassword } from "../../../domain/entities/user";

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * Execute the use case to get a user by ID
   * @param userId User ID
   * @returns User without password or error
   */
  async execute(
    userId: string
  ): Promise<
    | { success: true; data: { user: UserWithoutPassword } }
    | { success: false; error: ErrorResponseDto; status: number }
  > {
    try {
      // Get user
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return {
          success: false,
          error: { message: "User not found" },
          status: 404,
        };
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      console.error("Error in GetUserUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }

  /**
   * Execute the use case to get a user by email
   * @param email User email
   * @returns User without password or error
   */
  async executeByEmail(
    email: string
  ): Promise<
    | { success: true; data: { user: UserWithoutPassword } }
    | { success: false; error: ErrorResponseDto; status: number }
  > {
    try {
      // Get user
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return {
          success: false,
          error: { message: "User not found" },
          status: 404,
        };
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: { user: userWithoutPassword },
      };
    } catch (error) {
      console.error("Error in GetUserUseCase:", error);
      return {
        success: false,
        error: { message: "Something went wrong" },
        status: 500,
      };
    }
  }
}
