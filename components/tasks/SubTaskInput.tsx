"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface SubTask {
  id: string;
  title: string;
}

interface SubTaskInputProps {
  subtasks: SubTask[];
  setSubtasks: React.Dispatch<React.SetStateAction<SubTask[]>>;
}

// Simple function to generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default function SubTaskInput({
  subtasks,
  setSubtasks,
}: SubTaskInputProps) {
  const [newSubtask, setNewSubtask] = useState("");

  const addSubtask = () => {
    if (newSubtask.trim() === "") return;

    setSubtasks([...subtasks, { id: generateId(), title: newSubtask.trim() }]);
    setNewSubtask("");
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((subtask) => subtask.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add a subtask"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          onClick={addSubtask}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {subtasks.length > 0 && (
        <div className="space-y-2 mt-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
            >
              <span className="text-sm text-gray-700">{subtask.title}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSubtask(subtask.id)}
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
