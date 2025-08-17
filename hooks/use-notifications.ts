"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationManager } from "@/lib/notifications"
import { db } from "@/lib/database"
import type { AppSettings } from "@/lib/types"

export function useNotifications() {
  const [permission, setPermission] = useState<"default" | "granted" | "denied">("default")
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(notificationManager.isSupported())
    setPermission(notificationManager.getPermission())
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const appSettings = await db.getSettings()
      setSettings(appSettings)
    } catch (error) {
      console.error("Failed to load notification settings:", error)
    }
  }

  const requestPermission = useCallback(async () => {
    const newPermission = await notificationManager.requestPermission()
    setPermission(newPermission)
    return newPermission
  }, [])

  const showNotification = useCallback(
    async (title: string, body?: string, options?: any) => {
      if (!settings?.notificationsEnabled || permission !== "granted") {
        return null
      }

      return notificationManager.showNotification({
        title,
        body,
        ...options,
      })
    },
    [permission, settings],
  )

  const showReminderNotification = useCallback(
    async (todoTitle: string, todoId: string) => {
      if (!settings?.notificationsEnabled || permission !== "granted") {
        return null
      }

      return notificationManager.showReminderNotification(todoTitle, todoId)
    },
    [permission, settings],
  )

  const scheduleNotification = useCallback(
    async (title: string, body: string, delay: number, options?: any) => {
      if (!settings?.notificationsEnabled || permission !== "granted") {
        return null
      }

      return notificationManager.scheduleNotification(
        {
          title,
          body,
          ...options,
        },
        delay,
      )
    },
    [permission, settings],
  )

  const testNotification = useCallback(async () => {
    return notificationManager.testNotification()
  }, [])

  return {
    permission,
    settings,
    isSupported,
    requestPermission,
    showNotification,
    showReminderNotification,
    scheduleNotification,
    testNotification,
    refetchSettings: loadSettings,
  }
}
