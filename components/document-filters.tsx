"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSearchParams } from "next/navigation";

interface DocumentFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  onSortChange: (sort: string) => void;
  activeFilters: string[];
}

export function DocumentFilters({
  onSearch,
  onFilterChange,
  onSortChange,
  activeFilters,
}: DocumentFiltersProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only trigger the search callback when the debounced value changes
  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            defaultValue={searchParams.get("sort") || "updated_desc"}
            onValueChange={onSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_desc">Last Updated</SelectItem>
              <SelectItem value="created_desc">Create Date</SelectItem>
              <SelectItem value="title_asc">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ToggleGroup
          type="multiple"
          value={activeFilters}
          onValueChange={onFilterChange}
        >
          <ToggleGroupItem value="shared_with_me">
            Shared with me
          </ToggleGroupItem>
          <ToggleGroupItem value="shared_with_others">
            Shared with others
          </ToggleGroupItem>
          <ToggleGroupItem value="private">Private</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary">
              {filter.split("_").join(" ")}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  onFilterChange(activeFilters.filter((f) => f !== filter))
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={() => onFilterChange([])}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
