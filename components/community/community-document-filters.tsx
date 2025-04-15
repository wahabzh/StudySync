"use client";

import { useEffect, useState } from "react";
import { type Document } from "@/types/database";
import { getCommunityDocuments } from "@/app/community-actions";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "use-debounce";

interface DocumentFiltersProps {
    setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

export function CommunityDocumentFilters({
    setDocuments,
}: DocumentFiltersProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
    const [sort, setSort] = useState("updated_desc");
    const [isLoading, setIsLoading] = useState(false);

    const fetchCommunityDocuments = async () => {
        setIsLoading(true);
        try {
            const documents = await getCommunityDocuments(debouncedSearchQuery, sort);
            setDocuments(documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunityDocuments();
    }, [debouncedSearchQuery, sort]);

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-full max-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-full focus-visible:ring-offset-0"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                    </div>
                )}
            </div>

            <Select defaultValue={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[140px] h-9 gap-1">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="created_desc">Recently Added</SelectItem>
                    <SelectItem value="updated_desc">Last Updated</SelectItem>
                    <SelectItem value="title_asc">Title A-Z</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

