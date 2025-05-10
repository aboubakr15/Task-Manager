import { PrismaClient } from "@prisma/client";
import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/userRepository";

/**
 * Prisma implementation of UserRepository
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by username
   * @param username Username
   * @returns User or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   * @param data User data
   * @returns Created user
   */
  async create(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }
}
