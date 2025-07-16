import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline"

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "error" | "warning" | "info"
    title?: string
    description?: string
    action?: React.ReactNode
    onClose?: () => void
  }
>(({ className, variant = "default", title, description, action, onClose, ...props }, ref) => {
  const variantClasses = {
    default: "border-border bg-background text-foreground",
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
    info: "border-blue-200 bg-blue-50 text-blue-800"
  }

  const iconClasses = {
    default: "text-foreground",
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600"
  }

  const icons = {
    default: InformationCircleIcon,
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }

  const Icon = icons[variant]

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconClasses[variant])} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold">{title}</p>
          )}
          {description && (
            <p className="text-sm mt-1 opacity-90">{description}</p>
          )}
          {action && (
            <div className="mt-3">{action}</div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            title="Close notification"
            className="inline-flex shrink-0 rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
})

Toast.displayName = "Toast"

export { Toast }
