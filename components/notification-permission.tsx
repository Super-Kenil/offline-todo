"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { notificationManager } from "@/lib/notifications"
import { Bell, BellOff, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export function NotificationPermission() {
  const [permission, setPermission] = useState<"default" | "granted" | "denied">("default")
  const [isRequesting, setIsRequesting] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    const currentPermission = notificationManager.getPermission()
    setPermission(currentPermission)
    setShowCard(currentPermission !== "granted")
  }, [])

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    try {
      const newPermission = await notificationManager.requestPermission()
      setPermission(newPermission)
      if (newPermission === "granted") {
        setShowCard(false)
        // Show a test notification
        setTimeout(() => {
          notificationManager.testNotification()
        }, 1000)
      }
    } catch (error) {
      console.error("Failed to request permission:", error)
    } finally {
      setIsRequesting(false)
    }
  }

  const handleTestNotification = async () => {
    await notificationManager.testNotification()
  }

  if (!notificationManager.isSupported()) {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Your browser doesn't support notifications.</AlertDescription>
      </Alert>
    )
  }

  if (!showCard && permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span>Notifications enabled</span>
        <Button variant="ghost" size="sm" onClick={handleTestNotification} className="h-6 px-2 text-xs">
          Test
        </Button>
      </div>
    )
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {permission === "granted" ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : permission === "denied" ? (
            <BellOff className="h-5 w-5 text-red-500" />
          ) : (
            <Bell className="h-5 w-5 text-primary" />
          )}
          <CardTitle className="text-lg">
            {permission === "granted"
              ? "Notifications Enabled"
              : permission === "denied"
                ? "Notifications Blocked"
                : "Enable Notifications"}
          </CardTitle>
        </div>
        <CardDescription>
          {permission === "granted"
            ? "You'll receive reminders for your tasks."
            : permission === "denied"
              ? "Notifications are blocked. Enable them in your browser settings to receive reminders."
              : "Get notified about your task reminders even when the app is closed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {permission === "default" && (
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <Bell className="w-4 h-4 mr-2" />
            {isRequesting ? "Requesting..." : "Enable Notifications"}
          </Button>
        )}

        {permission === "granted" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestNotification} className="flex-1 bg-transparent">
              Test Notification
            </Button>
            <Button variant="ghost" onClick={() => setShowCard(false)} size="sm">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {permission === "denied" && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              To enable notifications, click the lock icon in your browser's address bar and allow notifications for
              this site.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
