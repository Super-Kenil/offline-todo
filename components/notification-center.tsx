"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationPermission } from "@/components/notification-permission"
import { NotificationSettings } from "@/components/notification-settings"
import { useNotifications } from "@/hooks/use-notifications"
import { Bell, Settings, TestTube } from "lucide-react"

export function NotificationCenter() {
  const { testNotification, permission } = useNotifications()
  const [isTestingNotification, setIsTestingNotification] = useState(false)

  const handleTestNotification = async () => {
    setIsTestingNotification(true)
    try {
      await testNotification()
    } catch (error) {
      console.error("Failed to test notification:", error)
    } finally {
      setIsTestingNotification(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Notification Center</CardTitle>
            <CardDescription>Manage your notification preferences and permissions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="permissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            <NotificationPermission />

            {permission === "granted" && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleTestNotification}
                  disabled={isTestingNotification}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <TestTube className="h-4 w-4" />
                  {isTestingNotification ? "Sending..." : "Test Notification"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
