import * as React from "react";
// import { cn } from "../../lib/utils";
import { cn } from "../../lib/utlis";

export function Button({ className, children, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
