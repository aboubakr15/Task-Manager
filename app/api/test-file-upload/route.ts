import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { existsSync } from "fs";
import { stat } from "fs/promises";

// This is a test endpoint to verify file uploads are working
export async function POST(req: NextRequest) {
  try {
    console.log("Test file upload endpoint called");
    
    const formData = await req.formData();
    console.log("FormData received:", Array.from(formData.entries()).map(([key]) => key));
    
    const file = formData.get("file") as File;
    
    if (!file) {
      console.error("No file provided in the request");
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }
    
    console.log(`File received: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFilename = `test_${timestamp}_${file.name}`;
    
    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Define the upload directory
    const uploadDir = join(cwd(), "public", "uploads");
    console.log(`Upload directory: ${uploadDir}`);
    
    // Check if the directory exists and create it if it doesn't
    try {
      if (!existsSync(uploadDir)) {
        console.log(`Creating uploads directory at ${uploadDir}`);
        await mkdir(uploadDir, { recursive: true });
      }
      
      // Check directory permissions
      const stats = await stat(uploadDir);
      console.log(`Directory permissions: ${stats.mode.toString(8)}`);
    } catch (error) {
      console.error(`Error with upload directory: ${error.message}`);
      return NextResponse.json(
        { message: `Upload directory error: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Save the file
    const filePath = join(uploadDir, uniqueFilename);
    console.log(`Saving file to ${filePath}`);
    
    try {
      await writeFile(filePath, buffer);
      console.log(`File saved successfully to ${filePath}`);
      
      // Verify the file was saved
      if (existsSync(filePath)) {
        const fileStats = await stat(filePath);
        console.log(`Saved file size: ${fileStats.size} bytes`);
      } else {
        console.error(`File was not saved at ${filePath}`);
      }
    } catch (error) {
      console.error(`Error writing file: ${error.message}`);
      return NextResponse.json(
        { message: `Failed to write file: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      {
        message: "File uploaded successfully",
        file: {
          name: file.name,
          url: `/uploads/${uniqueFilename}`,
          type: file.type,
          size: file.size,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in test file upload:", error);
    return NextResponse.json(
      { message: `Something went wrong: ${error.message}` },
      { status: 500 }
    );
  }
}
