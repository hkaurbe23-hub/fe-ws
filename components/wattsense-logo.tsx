import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function WattSenseLogo({
  collapsed = false,
  className,
}: {
  collapsed?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <Zap className="size-4 text-primary-foreground" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          WattSense
        </span>
      )}
    </div>
  )
}
