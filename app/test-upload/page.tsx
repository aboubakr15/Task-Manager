"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Loader2 } from "lucide-react";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      const formData = new FormData();
      formData.append("file", file);

      console.log("FormData created with file");
      
      const response = await fetch("/api/test-file-upload", {
        method: "POST",
        body: formData,
      });

      console.log(`Response status: ${response.status}`);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload file");
      }

      setResult(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Directly uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      const formData = new FormData();
      formData.append("file", file);

      console.log("FormData created with file for direct upload");
      
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      console.log(`Direct upload response status: ${response.status}`);
      
      const data = await response.json();
      console.log("Direct upload response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload file directly");
      }

      setResult(data);
    } catch (error) {
      console.error("Error directly uploading file:", error);
      setError(error instanceof Error ? error.message : "Failed to upload file directly");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Test File Upload</h1>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {result && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                <p>File uploaded successfully!</p>
                <p>URL: <a href={result.file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{result.file.url}</a></p>
                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              
              {file && (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.size < 1024
                      ? `${file.size} bytes`
                      : file.size < 1048576
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : `${(file.size / 1048576).toFixed(1)} MB`}
                    {" - "}
                    {file.type || "Unknown type"}
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Upload
                </Button>
                
                <Button
                  onClick={handleDirectUpload}
                  disabled={!file || loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Direct Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
