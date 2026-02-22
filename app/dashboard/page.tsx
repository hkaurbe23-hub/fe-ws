"use client"

import {
  CircuitBoard,
  Activity,
  Zap,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFloorsContext } from "@/lib/floor-context"

export default function DashboardPage() {
  const { boards } = useFloorsContext()

 

  const totalBoards = boards.length
  const activeBoards = boards.filter((b) => b.enabled).length
  const inactiveBoards = boards.filter((b) => !b.enabled).length

  const stats = [
    {
      title: "Total Boards",
      value: totalBoards,
      icon: CircuitBoard,
      description: "Registered devices",
    },
    {
      title: "Active Boards",
      value: activeBoards,
      icon: Activity,
      description: "Currently enabled",
    },
    {
      title: "Inactive Boards",
      value: inactiveBoards,
      icon: Zap,
      description: "Currently disabled",
    },
    {
      title: "Uptime",
      value: "99.8%",
      icon: TrendingUp,
      description: "Last 30 days",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your energy monitoring fleet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Navigate to the{" "}
            <a
              href="/dashboard/boards"
              className="font-medium text-primary hover:underline"
            >
              Boards
            </a>{" "}
            module to manage your device fleet, or check{" "}
            <a
              href="/dashboard/analytics"
              className="font-medium text-primary hover:underline"
            >
              Analytics
            </a>{" "}
            for usage insights.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

