import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, memberId } = params;

    // Check if current user is an admin of the team
    const currentUserMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: "admin",
      },
    });

    if (!currentUserMember) {
      return NextResponse.json(
        { message: "Only team admins can remove members" },
        { status: 403 }
      );
    }

    // Get the member to delete
    const memberToDelete = await db.teamMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!memberToDelete) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    // Prevent removing yourself
    if (memberToDelete.userId === session.user.id) {
      return NextResponse.json(
        { message: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Delete the team member
    await db.teamMember.delete({
      where: {
        id: memberId,
      },
    });

    return NextResponse.json({
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
