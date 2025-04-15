"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { ArrowRight, HeartIcon, ClockIcon, BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunityDocumentCardProps {
    id: string;
    title: string;
    lastEdited: string;
    claps: number;
    className?: string;
}

export function CommunityDocumentCard({
    id,
    title,
    lastEdited,
    claps,
    className,
}: CommunityDocumentCardProps) {
    return (
        <Card className={cn(
            "group flex flex-col h-full transition-all hover:shadow-md overflow-hidden",
            className
        )}>
            <Link href={`/community/doc/${id}`} className="flex-1 flex flex-col h-full">
                <CardHeader className="pb-2">
                    <div className="text-xs text-muted-foreground flex items-center mb-1">
                        <BookOpenText className="h-3 w-3 mr-1 inline" />
                        <span>Community Document</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                        {title}
                    </h3>
                </CardHeader>

                <CardContent className="py-2 flex-grow">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <HeartIcon className="h-4 w-4 text-rose-500" />
                            <span className="text-sm">{claps}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5" />
                            <span className="text-xs">{lastEdited}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-2 mt-auto border-t">
                    <span className="text-xs text-primary flex items-center gap-1 font-medium group-hover:underline">
                        Read document
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </CardFooter>
            </Link>
        </Card>
    );
}