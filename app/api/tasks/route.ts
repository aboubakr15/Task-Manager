import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for task creation validation
const taskCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().optional(),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  teamId: z.string().min(1, "Team is required"),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1, "Subtask title is required"),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // We no longer need to fetch user's teams since we're only showing assigned tasks

    // Get only tasks assigned to the user
    const tasks = await db.task.findMany({
      where: {
        assignedToId: session.user.id,
      },
      include: {
        subtasks: true,
        attachments: true,
        team: true, // Include team information for grouping
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Handle multipart form data
    const formData = await req.formData();
    const taskDataStr = formData.get("taskData") as string;

    if (!taskDataStr) {
      return NextResponse.json(
        { message: "Task data is required" },
        { status: 400 }
      );
    }

    const taskData = JSON.parse(taskDataStr);

    // Validate task data
    const validationResult = taskCreateSchema.safeParse(taskData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid task data",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Check if user is an admin of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: taskData.teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "You are not a member of this team" },
        { status: 403 }
      );
    }

    // Check if the user is an admin
    if (teamMember.role !== "admin") {
      console.log(
        `User ${session.user.id} attempted to create a task but is not an admin. Role: ${teamMember.role}`
      );
      return NextResponse.json(
        { message: "Only team admins can create tasks" },
        { status: 403 }
      );
    }

    console.log(
      `Admin check passed for user ${session.user.id}, team ${taskData.teamId}`
    );

    // Create task
    const task = await db.task.create({
      data: {
        title: taskData.title,
        content: taskData.content,
        status: taskData.status,
        priority: taskData.priority,
        teamId: taskData.teamId,
        assignedToId: taskData.assignedToId || null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      },
    });

    // Create notification if task is assigned to someone
    if (taskData.assignedToId) {
      // Get team information for the notification message
      const team = await db.team.findUnique({
        where: {
          id: taskData.teamId,
        },
        select: {
          name: true,
        },
      });

      console.log(`Creating notification for user ${taskData.assignedToId} for task ${task.id}`);

      try {
        // Create notification for the assigned user
        const notification = await db.notification.create({
          data: {
            type: "task_assigned",
            message: `You have been assigned a new task "${taskData.title}" in team "${team?.name}"`,
            userId: taskData.assignedToId,
            taskId: task.id,
          },
        });

        console.log("Notification created successfully:", notification);
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    }

    // Create subtasks if any
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      await db.subTask.createMany({
        data: taskData.subtasks.map((subtask: { title: string }) => ({
          title: subtask.title,
          taskId: task.id,
        })),
      });
    }

    // Process attachments if any
    const attachmentPromises = [];

    // Get all form entries
    const entries = Array.from(formData.entries());

    // Filter for attachment entries
    const attachmentEntries = entries.filter(([key]) =>
      key.startsWith("attachment_")
    );

    console.log(`Found ${attachmentEntries.length} attachments in form data`);

    for (const [key, value] of attachmentEntries) {
      const file = value as File;

      if (file && file.name) {
        console.log(
          `Processing attachment: ${key}, filename: ${file.name}, size: ${file.size} bytes, type: ${file.type}`
        );

        try {
          // Create a new FormData object for each file
          const fileFormData = new FormData();
          fileFormData.append("file", file);

          console.log(
            `Preparing to upload file: ${file.name}, size: ${file.size}, type: ${file.type}`
          );
          console.log(`File is instance of File: ${file instanceof File}`);

          // Use the test upload endpoint which has more debugging
          const uploadUrl = new URL(
            "/api/test-file-upload",
            req.url
          ).toString();
          console.log(`Uploading file to ${uploadUrl}`);

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: fileFormData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`Failed to upload file ${file.name}: ${errorText}`);
            continue;
          }

          const uploadData = await uploadResponse.json();
          console.log(`File uploaded successfully: ${uploadData.file.url}`);

          // Add the attachment to the database
          attachmentPromises.push(
            db.attachment.create({
              data: {
                name: uploadData.file.name,
                url: uploadData.file.url,
                type: uploadData.file.type || "application/octet-stream",
                size: uploadData.file.size || 0,
                taskId: task.id,
              },
            })
          );
        } catch (error) {
          console.error(`Error processing attachment ${file.name}:`, error);
        }
      } else {
        console.warn(`Invalid file in attachment ${key}`);
      }
    }

    // Wait for all attachment creations to complete
    if (attachmentPromises.length > 0) {
      console.log(
        `Creating ${attachmentPromises.length} attachments in database`
      );
      await Promise.all(attachmentPromises);
    } else {
      console.log("No attachments to create");
    }

    // Return the created task
    const createdTask = await db.task.findUnique({
      where: {
        id: task.id,
      },
      include: {
        subtasks: true,
        attachments: true,
      },
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task: createdTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
