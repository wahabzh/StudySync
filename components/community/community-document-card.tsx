"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { ArrowRight, HeartHandshakeIcon } from "lucide-react";

interface CommunityDocumentCardProps {
    id: string;
    title: string;
    lastEdited: string;
    claps: number;
}

export function CommunityDocumentCard({
    id,
    title,
    lastEdited,
    claps,
}: CommunityDocumentCardProps) {
    return (
        <Card className="group flex flex-col h-full transition-all hover:shadow-md">
            <Link href={`/community/doc/${id}`} className="flex-1">
                <CardHeader className="pb-2">
                    <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <HeartHandshakeIcon className="h-4 w-4" />
                        <span className="text-sm">{claps}</span>
                    </div>
                </CardContent>
                <CardFooter className="mt-auto pt-4 flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                        Last edited {lastEdited}
                    </p>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View document
                        <ArrowRight className="h-3 w-3" />
                    </span>
                </CardFooter>
            </Link>
        </Card>
    );
}