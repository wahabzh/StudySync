"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CommunityDocumentCard } from "./community-document-card";
import { getCommunityDocuments } from "@/app/community-actions";
import { Document } from "@/types/database";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

export function CommunityDocumentList() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("updated_desc");

    useEffect(() => {
        async function fetchDocuments() {
            setLoading(true);
            try {
                const docs = await getCommunityDocuments(search, sort);
                setDocuments(docs);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDocuments();
    }, [search, sort]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative md:w-1/2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search community documents..."
                        className="pl-8 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select
                        value={sort}
                        onValueChange={(value) => setSort(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                            <SelectItem value="created_desc">Newest</SelectItem>
                            <SelectItem value="updated_desc">Recently updated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-lg border border-border/50 p-6 shadow-sm animate-pulse h-[180px]"
                        >
                            <div className="h-6 w-2/3 bg-muted rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-5/6"></div>
                                <div className="h-4 bg-muted rounded w-4/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : documents.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map((document) => (
                        <CommunityDocumentCard
                            key={document.id}
                            id={document.id}
                            title={document.title}
                            lastEdited={format(document.updated_at, "MMM d, yyyy")}
                            claps={document.clap_count || 0}
                        />
                    ))}
                </div>
            ) : (
                <Alert variant="default" className="bg-muted/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No documents found</AlertTitle>
                    <AlertDescription>
                        {search
                            ? "Try adjusting your search term."
                            : "No published documents in the community yet."}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
} 