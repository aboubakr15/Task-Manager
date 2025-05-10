import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for subtask creation validation
const subtaskCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

// Schema for subtask update validation
const subtaskUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  completed: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const taskId = params.id;

    // Get task to check permissions
    const task = await db.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: task.teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "You are not authorized to view this task" },
        { status: 403 }
      );
    }

    // Get subtasks
    const subtasks = await db.subTask.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ subtasks });
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const taskId = params.id;
    const data = await req.json();

    // Validate subtask data
    const validationResult = subtaskCreateSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Invalid subtask data", 
          errors: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    // Get task to check permissions
    const task = await db.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: task.teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "You are not authorized to update this task" },
        { status: 403 }
      );
    }

    // Create subtask
    const subtask = await db.subTask.create({
      data: {
        title: data.title,
        taskId,
      },
    });

    return NextResponse.json(
      { 
        message: "Subtask created successfully", 
        subtask 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
