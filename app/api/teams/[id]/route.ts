import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
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

    // Get team with members
    const team = await db.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Add isCurrentUser flag to each team member
    const membersWithFlag = team.members.map((member) => ({
      ...member,
      isCurrentUser: member.userId === session.user.id,
    }));

    const teamWithCurrentUserFlag = {
      ...team,
      members: membersWithFlag,
    };

    console.log(`User ${session.user.id} accessing team ${teamId}`);
    console.log(
      `User is admin: ${membersWithFlag.some(
        (m) => m.isCurrentUser && m.role === "admin"
      )}`
    );

    return NextResponse.json({ team: teamWithCurrentUserFlag });
  } catch (error) {
    console.error("Error fetching team:", error);
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

    const teamId = params.id;
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { message: "Team name is required" },
        { status: 400 }
      );
    }

    // Check if user is an admin of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: "admin",
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "Only team admins can update team details" },
        { status: 403 }
      );
    }

    // Update team
    const updatedTeam = await db.team.update({
      where: {
        id: teamId,
      },
      data: {
        name,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team:", error);
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

    const teamId = params.id;

    // Check if user is an admin of the team
    const teamMember = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: "admin",
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "Only team admins can delete teams" },
        { status: 403 }
      );
    }

    // Delete team (this will cascade delete team members)
    await db.team.delete({
      where: {
        id: teamId,
      },
    });

    return NextResponse.json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
