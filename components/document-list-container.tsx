"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DocumentFilters } from "./document-filters";

export function DocumentListContainer({
  children,
  activeFilters,
}: {
  children: React.ReactNode;
  activeFilters: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <DocumentFilters
        onSearch={(query) => updateSearchParams({ search: query || undefined })}
        onFilterChange={(filters) =>
          updateSearchParams({ filters: filters.join(",") || undefined })
        }
        onSortChange={(sort) => updateSearchParams({ sort })}
        activeFilters={activeFilters}
      />
      {children}
    </>
  );
}
