"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DocumentFilters } from "./document-filters";
import { useCallback, useMemo } from "react";

export function DocumentListContainer({
  children,
  activeFilters,
}: {
  children: React.ReactNode;
  activeFilters: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize the current search params
  const currentParams = useMemo(() => {
    return new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(currentParams.toString());
      let hasChanges = false;

      Object.entries(updates).forEach(([key, value]) => {
        const currentValue = newParams.get(key);
        if (value === undefined || value === "") {
          if (currentValue !== null) {
            newParams.delete(key);
            hasChanges = true;
          }
        } else if (currentValue !== value) {
          newParams.set(key, value);
          hasChanges = true;
        }
      });

      // Only update if there are actual changes
      if (hasChanges) {
        const newParamsString = newParams.toString();
        router.push(newParamsString ? `?${newParamsString}` : ".");
      }
    },
    [router, currentParams]
  );

  const handleSearch = useCallback(
    (query: string) => {
      updateSearchParams({ search: query || undefined });
    },
    [updateSearchParams]
  );

  const handleFilterChange = useCallback(
    (filters: string[]) => {
      updateSearchParams({ filters: filters.join(",") || undefined });
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      updateSearchParams({ sort });
    },
    [updateSearchParams]
  );

  return (
    <>
      <DocumentFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        activeFilters={activeFilters}
      />
      {children}
    </>
  );
}
