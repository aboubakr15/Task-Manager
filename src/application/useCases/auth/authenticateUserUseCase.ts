import { compare } from "bcrypt";
import { UserRepository } from "../../../domain/repositories/userRepository";

export class AuthenticateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * Execute the use case to authenticate a user
   * @param email User email
   * @param password User password
   * @returns User data or null if authentication fails
   */
  async execute(
    email: string,
    password: string
  ): Promise<{ id: string; email: string; name?: string | null } | null> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return null;
      }

      // Verify password
      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      // Return user data for token
      return {
        id: user.id,
        email: user.email,
        name: user.username,
      };
    } catch (error) {
      console.error("Error in AuthenticateUserUseCase:", error);
      return null;
    }
  }
}
