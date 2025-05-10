"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, File } from "lucide-react";

interface Attachment {
  id: string;
  file: File;
}

interface AttachmentUploadProps {
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

// Simple function to generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default function AttachmentUpload({
  attachments,
  setAttachments,
}: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(`Selected ${e.target.files.length} files`);

      // Log detailed information about each file
      Array.from(e.target.files).forEach((file, index) => {
        console.log(`File ${index + 1}:`);
        console.log(`- Name: ${file.name}`);
        console.log(`- Size: ${file.size} bytes`);
        console.log(`- Type: ${file.type}`);
        console.log(
          `- Last Modified: ${new Date(file.lastModified).toISOString()}`
        );
      });

      const newAttachments = Array.from(e.target.files).map((file) => {
        const id = generateId();
        console.log(
          `Created attachment with id ${id} for file ${file.name} (${file.size} bytes)`
        );

        // Create a test to verify the file is valid
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log(
            `File ${file.name} read successfully, size: ${
              event.target?.result?.toString().length || 0
            } bytes`
          );
        };
        reader.onerror = (error) => {
          console.error(`Error reading file ${file.name}:`, error);
        };
        reader.readAsDataURL(file);

        return {
          id,
          file,
        };
      });

      setAttachments([...attachments, ...newAttachments]);
      console.log(
        `Total attachments: ${attachments.length + newAttachments.length}`
      );

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Add Attachments
        </Button>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2 mt-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
            >
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {attachment.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(attachment.file.size)}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
