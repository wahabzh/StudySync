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
import { getDocuments } from "@/app/actions";
import { Document } from "@/types/database";

interface DocumentFiltersProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  userId: string;
}

export function DocumentFilters({
  setDocuments,
  userId,
}: DocumentFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("updated_desc");
  const [filter, setFilter] = useState<string>("owned");

  useEffect(() => {
    if (userId === "0") setFilter("published");
    const fetchDocuments = async () => {
      const documents = await getDocuments(userId, searchQuery, sort, filter);
      setDocuments(documents);
    };
    fetchDocuments();
  }, [searchQuery, sort, filter]);

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
          <Select defaultValue={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Recently Added</SelectItem>
              <SelectItem value="updated_desc">Last Updated</SelectItem>
              <SelectItem value="title_asc">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
          {userId !== "0" && (<Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owned">Owned by me</SelectItem>
              <SelectItem value="shared">Shared with me</SelectItem>
              {/* <SelectItem value="published">Community</SelectItem> */}
            </SelectContent>
          </Select>)}
        </div>
      </div>
    </div>
  );
}
