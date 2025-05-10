"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  userId: string;
  taskId?: string;
  task?: {
    id: string;
    title: string;
    teamId: string;
    team: {
      name: string;
    };
  };
  createdAt: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications when the component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching notifications...");
      const response = await fetch("/api/notifications");
      console.log("Notifications API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Notifications received:", data);
        setNotifications(data.notifications || []);
      } else {
        const errorText = await response.text();
        console.error("Error response from notifications API:", errorText);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
        }),
      });

      if (response.ok) {
        // Update the local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (response.ok) {
        // Update all notifications to read in the local state
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative w-full">
      <Button
        variant="ghost"
        className="relative w-full flex justify-between items-center rounded-lg text-white hover:bg-blue-700/50 px-4 py-3"
        onClick={() => {
          setIsOpen(!isOpen);
          // Refresh notifications when opening the dropdown
          if (!isOpen) {
            fetchNotifications();
          }
        }}
      >
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <span className="font-normal">My Notifications</span>
        </div>
        {unreadCount > 0 && (
          <span className="h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-[280px] bg-white rounded-md shadow-lg z-50 overflow-hidden border border-blue-200">
          <div className="p-3 border-b border-blue-100 flex justify-between items-center bg-blue-50">
            <h3 className="font-medium text-blue-800">Recent Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-blue-600">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 mb-2 rounded-full bg-blue-200"></div>
                  <div className="text-sm">Loading notifications...</div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="flex flex-col items-center">
                  <Bell className="h-8 w-8 mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll be notified when you're assigned tasks
                  </p>
                </div>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-3 border-b hover:bg-gray-50 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {notification.message}
                        </p>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                          {notification.taskId && (
                            <Link
                              href={`/dashboard/tasks/${notification.taskId}`}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200 transition-colors"
                              onClick={() => markAsRead(notification.id)}
                            >
                              View Task
                            </Link>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
