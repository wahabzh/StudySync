"use client";

import { useState, useEffect } from "react";
import { CommunityDocumentCard } from "./community-document-card";
import { CommunityDocument, getCommunityDocuments } from "@/lib/community";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityDocumentList() {
    const [documents, setDocuments] = useState<CommunityDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    useEffect(() => {
        async function loadDocuments() {
            setLoading(true);
            try {
                const docs = await getCommunityDocuments(searchQuery, sortBy);
                setDocuments(docs);
            } catch (error) {
                console.error("Failed to fetch community documents:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDocuments();
    }, [searchQuery, sortBy]);

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search documents..."
                        className="w-full pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="title">Alphabetical</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-32 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <Alert variant="default" className="bg-muted/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No documents found</AlertTitle>
                    <AlertDescription>
                        There are no community documents matching your search.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                        <CommunityDocumentCard
                            key={doc.id}
                            id={doc.id}
                            title={doc.title}
                            lastEdited={doc.lastEdited}
                            claps={doc.claps}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 