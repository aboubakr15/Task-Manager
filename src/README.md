# Clean Architecture Implementation

This project follows the principles of Clean Architecture, which separates the codebase into distinct layers with clear responsibilities.

## Project Structure

```
src/
├── domain/             # Domain Layer (Entities & Repository Interfaces)
│   ├── entities/       # Business entities and value objects
│   └── repositories/   # Repository interfaces
├── application/        # Application Layer (Use Cases)
│   ├── dtos/           # Data Transfer Objects
│   └── useCases/       # Business logic use cases
│       ├── auth/       # Authentication use cases
│       ├── task/       # Task-related use cases
│       ├── team/       # Team-related use cases
│       └── user/       # User-related use cases
└── infrastructure/     # Infrastructure Layer (External Implementations)
    ├── repositories/   # Repository implementations
    └── services/       # External service implementations
```

## Layers

### Domain Layer

The innermost layer containing business entities and repository interfaces. This layer has no dependencies on other layers or external frameworks.

- **Entities**: Core business objects (Task, User, Team, etc.)
- **Repository Interfaces**: Contracts for data access (TaskRepository, TeamRepository, UserRepository)

### Application Layer

Contains the business logic of the application, organized as use cases. This layer depends only on the domain layer.

- **Use Cases**: Specific business operations
- **DTOs**: Data Transfer Objects for input/output

### Infrastructure Layer

The outermost layer that implements interfaces defined in the inner layers. This layer can depend on external frameworks and libraries.

- **Repository Implementations**: Database access using Prisma
- **Services**: External service implementations

### Presentation Layer

The API routes in `app/api/` that handle HTTP requests and responses. This layer depends on the application layer.

## Benefits

- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Business logic can be tested independently of external dependencies
- **Maintainability**: Changes in one layer don't affect other layers
- **Flexibility**: External frameworks can be replaced without affecting business logic
- **Single Responsibility**: Each repository is responsible for its own domain entity
- **No Direct Database Access**: Routes never access the database directly

## Key Features

- **Authentication**: Uses clean architecture for user authentication
- **User Management**: Registration and profile management
- **Team Management**: Creating and managing teams
- **Task Management**: Creating, updating, and deleting tasks

## Usage

The API routes in `app/api/` use the clean architecture components by:

1. Importing use cases from the application layer
2. Creating instances of repositories and services from the infrastructure layer
3. Executing use cases with the appropriate parameters
4. Handling the response and returning it to the client

Example:

```typescript
// Import use cases
import { GetTaskUseCase } from "@/src/application/useCases/task/getTaskUseCase";

// Import repositories
import { PrismaTaskRepository } from "@/src/infrastructure/repositories/prismaTaskRepository";
import { PrismaTeamRepository } from "@/src/infrastructure/repositories/prismaTeamRepository";

// Create instances
const taskRepository = new PrismaTaskRepository(db);
const teamRepository = new PrismaTeamRepository(db);
const getTaskUseCase = new GetTaskUseCase(taskRepository, teamRepository);

// Execute use case
const result = await getTaskUseCase.execute(taskId, userId);

// Handle response
if (!result.success) {
  return NextResponse.json(result.error, { status: result.status });
}

return NextResponse.json(result.data);
```
