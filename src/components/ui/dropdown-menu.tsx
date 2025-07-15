// src/ui/dropdown-menu.tsx
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = DropdownMenuPrimitive.Content;
export const DropdownMenuItem = DropdownMenuPrimitive.Item;
export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

// Styled components with plain Tailwind CSS
export const DropdownMenuContentStyled = React.forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuContentProps
>(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.Content
    ref={ref}
    className={`z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-white p-1 shadow-md dark:bg-gray-800 dark:border-gray-700 ${className}`}
    {...props}
  />
));
DropdownMenuContentStyled.displayName = "DropdownMenuContent";

export const DropdownMenuItemStyled = React.forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuItemProps
>(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    {...props}
  />
));
DropdownMenuItemStyled.displayName = "DropdownMenuItem";

export const DropdownMenuLabelStyled = React.forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuLabelProps
>(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={`px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  />
));
DropdownMenuLabelStyled.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparatorStyled = React.forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuSeparatorProps
>(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={`-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-600 ${className}`}
    {...props}
  />
));
DropdownMenuSeparatorStyled.displayName = "DropdownMenuSeparator";