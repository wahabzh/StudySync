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
import { Search } from "lucide-react";

interface DocumentFiltersProps {
    setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

export function CommunityDocumentFilters({
    setDocuments,
}: DocumentFiltersProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState("updated_desc");

    const fetchCommunityDocuments = async () => {
        const documents = await getCommunityDocuments(searchQuery, sort);
        setDocuments(documents);
    };

    useEffect(() => {
        fetchCommunityDocuments();
    }, [searchQuery, sort]);


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
                </div>
            </div>
        </div>
    );
}

