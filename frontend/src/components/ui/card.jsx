import * as React from "react";
// import { cn } from "../../lib/utils";
import { cn } from "../../lib/utlis";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-6 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("text-gray-700", className)} {...props}>
      {children}
    </div>
  );
}
