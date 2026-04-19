import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface PlaceholderPageProps {
  title: string
  description: string
  icon: LucideIcon
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Icon className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
            This module is coming soon. Check back later for full functionality.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
