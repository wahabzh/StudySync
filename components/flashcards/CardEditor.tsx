"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

interface CardEditorProps {
    card: {
        id?: string;
        question: string;
        answer: string;
        position: number;
    };
    index: number;
    onChange: (index: number, field: "question" | "answer", value: string) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export function CardEditor({ card, index, onChange, onRemove, canRemove }: CardEditorProps) {
    return (
        <Card className="relative">
            <CardContent className="p-4">
                <div className="flex items-start gap-2">
                    <div className="flex items-center h-full pt-2 cursor-move text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-grow space-y-3">
                        <div className="space-y-1">
                            <label
                                htmlFor={`question-${index}`}
                                className="text-sm font-medium"
                            >
                                Question
                            </label>
                            <Input
                                id={`question-${index}`}
                                value={card.question}
                                onChange={(e) => onChange(index, "question", e.target.value)}
                                placeholder="Enter question"
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor={`answer-${index}`}
                                className="text-sm font-medium"
                            >
                                Answer
                            </label>
                            <Textarea
                                id={`answer-${index}`}
                                value={card.answer}
                                onChange={(e) => onChange(index, "answer", e.target.value)}
                                placeholder="Enter answer"
                                rows={3}
                            />
                        </div>
                    </div>

                    {canRemove && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRemove}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 