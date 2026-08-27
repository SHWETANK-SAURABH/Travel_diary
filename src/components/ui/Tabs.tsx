"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { cn } from "./cn";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idPrefix: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* components must be used inside <Tabs>");
  return ctx;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const idPrefix = useId();
  const current = value ?? internalValue;

  const setValue = (next: string) => {
    setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue, idPrefix }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="tablist" className={cn("flex gap-1 border-b border-border", className)}>
      {children}
    </div>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { value: active, setValue, idPrefix } = useTabsContext();
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${idPrefix}-tab-${value}`}
      aria-controls={`${idPrefix}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-fast",
        selected ? "border-marigold-500 text-ink" : "border-transparent text-ink-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { value: active, idPrefix } = useTabsContext();
  if (active !== value) return null;

  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${value}`} aria-labelledby={`${idPrefix}-tab-${value}`} className="pt-4">
      {children}
    </div>
  );
}
