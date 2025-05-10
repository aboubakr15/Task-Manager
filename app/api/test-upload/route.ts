import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { existsSync } from "fs";

export async function GET() {
  try {
    // Define the path where the file will be saved
    const uploadDir = join(cwd(), "public", "uploads");
    
    // Ensure the uploads directory exists
    if (!existsSync(uploadDir)) {
      console.log(`Creating uploads directory at ${uploadDir}`);
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Create a test file
    const testFilePath = join(uploadDir, "test-file.txt");
    const testContent = `This is a test file created at ${new Date().toISOString()}`;
    
    console.log(`Writing test file to ${testFilePath}`);
    
    try {
      // Write the file to the filesystem
      await writeFile(testFilePath, testContent);
      console.log(`Test file saved successfully to ${testFilePath}`);
      
      return NextResponse.json({
        message: "Test file created successfully",
        path: testFilePath,
        url: "/uploads/test-file.txt"
      });
    } catch (error) {
      console.error(`Error writing test file to ${testFilePath}:`, error);
      return NextResponse.json(
        { message: `Failed to write test file: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test upload:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
