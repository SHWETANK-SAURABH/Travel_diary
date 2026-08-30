"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./cn";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Shown below the track, e.g. "Busy & lively" / "Quiet & peaceful". */
  labels?: [string, string];
}

/** A styled `<input type="range">` — the crowd-preference slider (spec: "convert the selected position into a numeric preference"), reusable anywhere a continuous 0-100 value beats a categorical choice. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(({ className, labels, ...props }, ref) => (
  <div>
    <input
      ref={ref}
      type="range"
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-marigold-500",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold-500",
        className
      )}
      {...props}
    />
    {labels && (
      <div className="mt-1.5 flex justify-between text-caption text-ink-muted">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    )}
  </div>
));
Slider.displayName = "Slider";
