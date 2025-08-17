"use client"

export type NotificationPermission = "default" | "granted" | "denied"

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  actions?: any[] // NotificationAction[]
}

let permission: NotificationPermission = "default"
if (typeof window !== "undefined" && "Notification" in window) {
  permission = Notification.permission
}

function isSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) {
    console.warn("This browser does not support notifications")
    return "denied"
  }

  if (permission === "granted") {
    return "granted"
  }

  try {
    const newPermission = await Notification.requestPermission()
    permission = newPermission
    return newPermission
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return "denied"
  }
}

function getPermission(): NotificationPermission {
  if (isSupported()) {
    permission = Notification.permission
  }
  return permission
}

async function showNotification(options: NotificationOptions): Promise<Notification | null> {
  if (!isSupported()) {
    console.warn("Notifications not supported")
    return null
  }

  if (getPermission() !== "granted") {
    const newPermission = await requestPermission()
    if (newPermission !== "granted") {
      console.warn("Notification permission denied")
      return null
    }
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/icon-192x192.png",
      badge: options.badge || "/icon-192x192.png",
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      vibrate: options.vibrate || [200, 100, 200],
      ...options.actions && { actions: options.actions },
    })

    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 5000)
    }

    return notification
  } catch (error) {
    console.error("Error showing notification:", error)
    return null
  }
}

function scheduleNotification(options: NotificationOptions, delay: number): number {
  return window.setTimeout(() => {
    showNotification(options)
  }, delay)
}

function cancelScheduledNotification(timeoutId: number): void {
  clearTimeout(timeoutId)
}

async function showReminderNotification(todoTitle: string, todoId: string): Promise<Notification | null> {
  return showNotification({
    title: "TaskFlow Reminder",
    body: `Don't forget: ${todoTitle}`,
    tag: `reminder-${todoId}`,
    requireInteraction: true,
    data: {
      type: "reminder",
      todoId,
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200, 100, 200],
  })
}

async function testNotification(): Promise<void> {
  await showNotification({
    title: "Test Notification",
    body: "TaskFlow notifications are working!",
    tag: "test",
  })
}

export const notificationManager = {
  requestPermission,
  getPermission,
  isSupported,
  showNotification,
  scheduleNotification,
  cancelScheduledNotification,
  showReminderNotification,
  testNotification,
}
