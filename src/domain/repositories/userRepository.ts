import { User, UserWithoutPassword } from "../entities/user";

/**
 * Repository interface for User entity
 * Defines the contract for user-related data access operations
 */
export interface UserRepository {
  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by username
   * @param username Username
   * @returns User or null if not found
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Create a new user
   * @param data User data
   * @returns Created user
   */
  create(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User>;
}
