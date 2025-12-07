import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import TextareaAutosize from "react-textarea-autosize"

const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn("flex w-full items-center border rounded-md bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}
            {...props}
        />
    )
})
InputGroup.displayName = "InputGroup"

const InputGroupAddon = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn("flex items-center px-3", className)}
            {...props}
        />
    )
})
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn("h-full rounded-none", className)}
            {...props}
        />
    )
})
InputGroupButton.displayName = "InputGroupButton"

const InputGroupTextarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<typeof TextareaAutosize>
>(({ className, ...props }, ref) => {
    return (
        <TextareaAutosize
            ref={ref}
            className={cn(
                "flex w-full resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
})
InputGroupTextarea.displayName = "InputGroupTextarea"

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea }
