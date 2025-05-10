/**
 * User entity representing the core business object
 */
export interface User {
  id: string;
  username?: string | null;
  email: string;
  password: string;
  createdAt: Date;
}

/**
 * User without sensitive information (password)
 */
export type UserWithoutPassword = Omit<User, 'password'>;

/**
 * User with related entities
 */
export interface UserWithRelations extends User {
  tasks?: any[];
  teams?: any[];
  notifications?: any[];
}
