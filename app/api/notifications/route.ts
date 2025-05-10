import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for marking notifications as read
const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()),
});

// GET /api/notifications - Get all notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all notifications for the user
    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            teamId: true,
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const validationResult = markAsReadSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { notificationIds } = validationResult.data;

    // Mark notifications as read
    await db.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: session.user.id, // Ensure user can only mark their own notifications as read
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
