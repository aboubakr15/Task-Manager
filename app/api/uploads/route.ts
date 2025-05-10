import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir, stat } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { existsSync } from "fs";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    console.log("File upload API called");

    // Skip auth check for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    console.log("Parsing form data");
    const formData = await req.formData();
    console.log(
      "Form data entries:",
      Array.from(formData.entries()).map(([key]) => key)
    );

    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file provided in the request");
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    console.log(
      `File received: ${file.name}, size: ${file.size}, type: ${file.type}`
    );

    // Generate a unique filename to prevent collisions
    const timestamp = Date.now();
    const originalName = file.name;
    const fileExtension = originalName.split(".").pop() || "";
    const uuid = randomUUID().substring(0, 8);
    const uniqueFilename = `${timestamp}_${uuid}.${fileExtension}`;

    console.log(`Generated unique filename: ${uniqueFilename}`);

    // Convert the file to a Buffer
    console.log("Converting file to buffer");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Buffer created with size: ${buffer.length} bytes`);

    // Define the path where the file will be saved
    const uploadDir = join(cwd(), "public", "uploads");
    console.log(`Upload directory: ${uploadDir}`);

    // Ensure the uploads directory exists
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

    const filePath = join(uploadDir, uniqueFilename);
    console.log(`Saving file to ${filePath}`);

    try {
      // Write the file to the filesystem
      await writeFile(filePath, buffer);
      console.log(`File saved successfully to ${filePath}`);

      // Verify the file was saved
      if (existsSync(filePath)) {
        const fileStats = await stat(filePath);
        console.log(`Saved file size: ${fileStats.size} bytes`);
      } else {
        console.error(`File was not saved at ${filePath}`);
        return NextResponse.json(
          { message: "File was not saved properly" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error(`Error writing file to ${filePath}:`, error);
      return NextResponse.json(
        { message: `Failed to write file: ${error.message}` },
        { status: 500 }
      );
    }

    // Return the URL to access the file
    const fileUrl = `/uploads/${uniqueFilename}`;
    console.log(`File URL: ${fileUrl}`);

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        file: {
          name: originalName,
          url: fileUrl,
          type: file.type,
          size: file.size,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: `Something went wrong: ${error.message}` },
      { status: 500 }
    );
  }
}
