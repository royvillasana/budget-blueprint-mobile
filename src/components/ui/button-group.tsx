import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex",
                orientation === "vertical" ? "flex-col" : "flex-row",
                className
            )}
            {...props}
        />
    )
})
ButtonGroup.displayName = "ButtonGroup"

const ButtonGroupText = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn("flex items-center px-3 py-2 text-sm", className)}
            {...props}
        />
    )
})
ButtonGroupText.displayName = "ButtonGroupText"

export { ButtonGroup, ButtonGroupText }
