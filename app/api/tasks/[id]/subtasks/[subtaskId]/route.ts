import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for subtask update validation
const subtaskUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: taskId, subtaskId } = params;
    const data = await req.json();

    // Validate subtask data
    const validationResult = subtaskUpdateSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Invalid subtask data", 
          errors: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    // Get subtask
    const subtask = await db.subTask.findUnique({
      where: {
        id: subtaskId,
      },
      include: {
        task: true,
      },
    });

    if (!subtask) {
      return NextResponse.json(
        { message: "Subtask not found" },
        { status: 404 }
      );
    }

    // Check if subtask belongs to the task
    if (subtask.taskId !== taskId) {
      return NextResponse.json(
        { message: "Subtask does not belong to this task" },
        { status: 400 }
      );
    }

    // Check if user is a member of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: subtask.task.teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "You are not authorized to update this subtask" },
        { status: 403 }
      );
    }

    // Update subtask
    const updatedSubtask = await db.subTask.update({
      where: {
        id: subtaskId,
      },
      data: {
        title: data.title,
        completed: data.completed,
      },
    });

    return NextResponse.json({ 
      message: "Subtask updated successfully", 
      subtask: updatedSubtask 
    });
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: taskId, subtaskId } = params;

    // Get subtask
    const subtask = await db.subTask.findUnique({
      where: {
        id: subtaskId,
      },
      include: {
        task: true,
      },
    });

    if (!subtask) {
      return NextResponse.json(
        { message: "Subtask not found" },
        { status: 404 }
      );
    }

    // Check if subtask belongs to the task
    if (subtask.taskId !== taskId) {
      return NextResponse.json(
        { message: "Subtask does not belong to this task" },
        { status: 400 }
      );
    }

    // Check if user is a member of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: subtask.task.teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "You are not authorized to delete this subtask" },
        { status: 403 }
      );
    }

    // Delete subtask
    await db.subTask.delete({
      where: {
        id: subtaskId,
      },
    });

    return NextResponse.json({ 
      message: "Subtask deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
