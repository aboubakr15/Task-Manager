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

    // Get team members
    const members = await db.teamMember.findMany({
      where: {
        teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching team members:", error);
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const teamId = params.id;
    const { email, role } = await req.json();

    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (
      !role ||
      typeof role !== "string" ||
      !["admin", "member"].includes(role)
    ) {
      return NextResponse.json(
        { message: "Valid role is required (admin or member)" },
        { status: 400 }
      );
    }

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
        { message: "Only team admins can add members" },
        { status: 403 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findFirst({
      where: {
        userId: user.id,
        teamId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Add user to team
    const member = await db.teamMember.create({
      data: {
        userId: user.id,
        teamId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Member added successfully", member },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
