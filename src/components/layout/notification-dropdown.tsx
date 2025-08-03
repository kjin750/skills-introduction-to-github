"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, CheckCheck, X } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // 30초마다 알림 새로고침
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("알림 조회 오류:", error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (response.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error("알림 읽음 처리 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error("모든 알림 읽음 처리 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER_CREATED":
        return "📦"
      case "ORDER_UPDATED":
        return "✏️"
      case "ORDER_SHIPPED":
        return "🚚"
      case "ORDER_DELIVERED":
        return "✅"
      default:
        return "🔔"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">알림</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              모두 읽음
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead([notification.id])
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium text-sm ${!notification.isRead ? "text-blue-900" : "text-gray-900"}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>새로운 알림이 없습니다.</p>
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              모든 알림 보기
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}