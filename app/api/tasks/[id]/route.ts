import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Import use cases
import { GetTaskUseCase } from "@/src/application/useCases/task/getTaskUseCase";
import { UpdateTaskUseCase } from "@/src/application/useCases/task/updateTaskUseCase";
import { DeleteTaskUseCase } from "@/src/application/useCases/task/deleteTaskUseCase";

// Import repositories and services
import { PrismaTaskRepository } from "@/src/infrastructure/repositories/prismaTaskRepository";
import { PrismaTeamRepository } from "@/src/infrastructure/repositories/prismaTeamRepository";
import { PrismaNotificationService } from "@/src/infrastructure/services/notificationService";

// Create instances of repositories and services
const taskRepository = new PrismaTaskRepository(db);
const teamRepository = new PrismaTeamRepository(db);
const notificationService = new PrismaNotificationService(db);

// Create instances of use cases
const getTaskUseCase = new GetTaskUseCase(taskRepository, teamRepository);
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, teamRepository, notificationService);
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository, teamRepository);

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;
    const result = await getTaskUseCase.execute(taskId, session.user.id);

    if (!result.success) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET task route:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;
    const data = await req.json();

    const result = await updateTaskUseCase.execute(taskId, session.user.id, data);

    if (!result.success) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in PATCH task route:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = params;
    const result = await deleteTaskUseCase.execute(taskId, session.user.id);

    if (!result.success) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in DELETE task route:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
