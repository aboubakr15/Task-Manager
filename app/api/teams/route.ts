import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Import use cases
import { GetTeamsUseCase } from "@/src/application/useCases/team/getTeamsUseCase";
import { CreateTeamUseCase } from "@/src/application/useCases/team/createTeamUseCase";

// Import repositories
import { PrismaTeamRepository } from "@/src/infrastructure/repositories/prismaTeamRepository";

// Create instances of repositories and use cases
const teamRepository = new PrismaTeamRepository(db);
const getTeamsUseCase = new GetTeamsUseCase(teamRepository);
const createTeamUseCase = new CreateTeamUseCase(teamRepository);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Execute the use case
    const result = await getTeamsUseCase.execute(session.user.id);

    if (!result.success) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // Execute the use case
    const result = await createTeamUseCase.execute(session.user.id, { name });

    if (!result.success) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
