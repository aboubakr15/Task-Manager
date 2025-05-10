"use client";

import { FileIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AttachmentListProps {
  attachments: Attachment[];
}

export default function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return <div className="text-gray-500 italic text-sm">No attachments</div>;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileTypeIcon = (type: string) => {
    // Simple file type detection based on MIME type
    if (type.startsWith("image/")) {
      return "🖼️";
    } else if (type.startsWith("video/")) {
      return "🎬";
    } else if (type.startsWith("audio/")) {
      return "🎵";
    } else if (type.includes("pdf")) {
      return "📄";
    } else if (
      type.includes("spreadsheet") ||
      type.includes("excel") ||
      type.includes("csv") ||
      type.includes("sheet") ||
      type.includes("xls")
    ) {
      return "📊";
    } else if (
      type.includes("document") ||
      type.includes("word") ||
      type.includes("doc") ||
      type.includes("text/plain")
    ) {
      return "📝";
    } else if (
      type.includes("presentation") ||
      type.includes("powerpoint") ||
      type.includes("ppt")
    ) {
      return "🎞️";
    } else if (
      type.includes("zip") ||
      type.includes("compressed") ||
      type.includes("archive") ||
      type.includes("rar") ||
      type.includes("tar") ||
      type.includes("7z")
    ) {
      return "🗜️";
    } else if (
      type.includes("code") ||
      type.includes("javascript") ||
      type.includes("json") ||
      type.includes("html") ||
      type.includes("css") ||
      type.includes("xml") ||
      type.includes("php") ||
      type.includes("python")
    ) {
      return "📜";
    } else {
      return "📁";
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Attachments ({attachments.length})
      </h3>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-700 mr-3">
                {getFileTypeIcon(attachment.type)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">
                  {attachment.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  console.log(`Opening attachment: ${attachment.url}`);
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  title="View"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </a>
              <a
                href={attachment.url}
                download={attachment.name}
                className="text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  console.log(`Downloading attachment: ${attachment.url}`);
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  title="Download"
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
