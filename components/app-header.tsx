"use client";

import {
  Search,
  LayoutGrid,
  List,
  LayoutGridIcon,
  Group,
  ChevronDown,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode, GroupByOption } from "@/lib/types";
import { useState, useRef, useEffect } from "react";

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  groupBy: GroupByOption;
  onGroupByChange: (groupBy: GroupByOption) => void;
  onOpenMobileMenu?: () => void;
}

const groupByOptions: { value: GroupByOption; label: string }[] = [
  { value: "none", label: "No Grouping" },
  { value: "status", label: "Group by Status" },
  { value: "rating", label: "Group by Rating" },
  { value: "platform", label: "Group by Platform" },
  { value: "customerType", label: "Group by Customer Type" },
  { value: "date", label: "Group by Date" },
];

export function AppHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  groupBy,
  onGroupByChange,
  onOpenMobileMenu,
}: AppHeaderProps) {
  const [groupByOpen, setGroupByOpen] = useState(false);
  const groupByRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        groupByRef.current &&
        !groupByRef.current.contains(event.target as Node)
      ) {
        setGroupByOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-lg hover:bg-accent cursor-pointer lg:hidden shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring cursor-text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Group By Dropdown */}
        <div ref={groupByRef} className="relative">
          <button
            onClick={() => setGroupByOpen(!groupByOpen)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-2 sm:px-3 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
              groupByOpen && "bg-background text-foreground"
            )}
          >
            <Group className="h-4 w-4" />
            <span className="hidden sm:inline">
              {groupByOptions.find((o) => o.value === groupBy)?.label || "Group By"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {groupByOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-md z-50">
              {groupByOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onGroupByChange(option.value);
                    setGroupByOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                    groupBy === option.value
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-1">
          <button
            onClick={() => onViewModeChange("squares")}
            className={cn(
              "rounded-md p-1.5 transition-colors cursor-pointer",
              viewMode === "squares"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Squares view"
          >
            <LayoutGridIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "rounded-md p-1.5 transition-colors cursor-pointer",
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "rounded-md p-1.5 transition-colors cursor-pointer",
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
