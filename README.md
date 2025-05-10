# TaskMaster - Next.js Task Management Application

TaskMaster is a modern task management application built with Next.js, Prisma, and SQLite. It allows users to create teams, manage tasks, and collaborate efficiently.

![TaskMaster](https://via.placeholder.com/800x400?text=TaskMaster+Screenshot)

## Features

- 🔐 User authentication with email/password and GitHub
- 👥 Team creation and management
- ✅ Task management with priorities, statuses, and due dates
- 📋 Subtasks for breaking down complex tasks
- 📎 File attachments for tasks
- 📱 Responsive design for all devices

### Setting up the project

1. Clone the repository:

   ```
   git clone https://github.com/AhmedQassemDev2004/Team-Task-Manager/
   cd next-task-manager
   ```
2. Install dependencies:
   ```
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory with the following variables:

   ```
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

## Running the Application

1. Initialize the database:

   ```
   npx prisma migrate dev --name init
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Database Management

- View and manage your database with Prisma Studio:

  ```
  npm run studio
  ```

  This will open a web interface at [http://localhost:5555](http://localhost:5555)

- Create a new migration after changing the schema:
  ```
  npx prisma migrate dev --name your_migration_name
  ```
