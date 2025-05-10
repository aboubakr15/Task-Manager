import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { GetUserUseCase } from "@/src/application/useCases/user/getUserUseCase";
import { PrismaUserRepository } from "@/src/infrastructure/repositories/prismaUserRepository";

// Create instances of repositories and use cases
const userRepository = new PrismaUserRepository(db);
const getUserUseCase = new GetUserUseCase(userRepository);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Execute the use case
    const result = await getUserUseCase.execute(session.user.id);

    if (!result.success) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
