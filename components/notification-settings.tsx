"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/database"
import type { AppSettings } from "@/lib/types"
import { Bell, Volume2, Clock } from "lucide-react"

export function NotificationSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const appSettings = await db.getSettings()
      setSettings(appSettings)
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (updates: Partial<AppSettings>) => {
    if (!settings) return

    try {
      const updatedSettings = await db.updateSettings(updates)
      setSettings(updatedSettings)
    } catch (error) {
      console.error("Failed to update settings:", error)
    }
  }

  if (loading || !settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Settings</CardTitle>
        </div>
        <CardDescription>Customize how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications for task reminders</p>
          </div>
          <Switch
            checked={settings.notificationsEnabled}
            onCheckedChange={(checked) => updateSetting({ notificationsEnabled: checked })}
          />
        </div>

        <Separator />

        {/* Sound Settings */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-base font-medium">Sound</Label>
              <p className="text-sm text-muted-foreground">Play sound with notifications</p>
            </div>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSetting({ soundEnabled: checked })}
            disabled={!settings.notificationsEnabled}
          />
        </div>

        <Separator />

        {/* Default Reminder Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Default Reminder Time</Label>
          </div>
          <p className="text-sm text-muted-foreground">How long before the due date should reminders be sent</p>
          <Select
            value={settings.defaultReminderMinutes.toString()}
            onValueChange={(value) => updateSetting({ defaultReminderMinutes: Number.parseInt(value) })}
            disabled={!settings.notificationsEnabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes before</SelectItem>
              <SelectItem value="15">15 minutes before</SelectItem>
              <SelectItem value="30">30 minutes before</SelectItem>
              <SelectItem value="60">1 hour before</SelectItem>
              <SelectItem value="120">2 hours before</SelectItem>
              <SelectItem value="1440">1 day before</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!settings.notificationsEnabled && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            Enable notifications to customize these settings
          </div>
        )}
      </CardContent>
    </Card>
  )
}
