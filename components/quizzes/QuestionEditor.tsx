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
        answer_a: string;
        answer_b: string;
        answer_c: string;
        answer_d: string;
        correct: number;
        position: number;
    };
    index: number;
    onChange: (index: number, field: "question" | "answer_a" | "answer_b" | "answer_c" | "answer_d", value: string) => void;
    onCorrectChange: (index: number, value: number) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export function QuestionEditor({ card, index, onChange, onCorrectChange, onRemove, canRemove }: CardEditorProps) {
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
                            <p className="text-sm font-medium">Answers (selecting an option marks it as correct):</p>
                            {(["a", "b", "c", "d"] as const).map((key, i) => {
                                const field = `answer_${key}` as "answer_a" | "answer_b" | "answer_c" | "answer_d";
                                const isCorrect = card.correct === i + 1;
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id={`correct-${index}-${key}`}
                                            name={`correct-${index}`}
                                            checked={isCorrect}
                                            onChange={() => onCorrectChange(index, i + 1)}
                                            className="h-4 w-4"
                                        />
                                        <label
                                            htmlFor={`correct-${index}-${key}`}
                                            className="text-sm font-medium"
                                        >
                                            {key}
                                        </label>
                                        <Textarea
                                            id={`${field}-${index}`}
                                            value={card[field]}
                                            onChange={(e) => onChange(index, field, e.target.value)}
                                            placeholder={`Enter answer ${key}`}
                                            rows={3}
                                            className={`flex-grow transition-colors ${isCorrect ? "border-green-500 bg-green-400" : ""}`}
                                        />
                                    </div>
                                );
                            })}
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