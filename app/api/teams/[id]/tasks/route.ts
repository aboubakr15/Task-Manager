import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const teamId = params.id;

    // Check if user is a member of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "You are not a member of this team" },
        { status: 403 }
      );
    }

    // Get tasks for the team
    const tasks = await db.task.findMany({
      where: {
        teamId,
      },
      include: {
        subtasks: true,
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching team tasks:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
