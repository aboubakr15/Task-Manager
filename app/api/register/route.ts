import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegisterUserUseCase } from "@/src/application/useCases/user/registerUserUseCase";
import { PrismaUserRepository } from "@/src/infrastructure/repositories/prismaUserRepository";

// Create instances of repositories and use cases
const userRepository = new PrismaUserRepository(db);
const registerUserUseCase = new RegisterUserUseCase(userRepository);

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Execute the use case
    const result = await registerUserUseCase.execute({
      username,
      email,
      password,
    });

    if (!result.success) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
