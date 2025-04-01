"use client";

import { QuizQuestion } from "@/types/database";
import { Card } from "@/components/ui/card";

interface QuizViewProps {
    card: QuizQuestion;
    selectedAnswer: number | null;
    onSelectAnswer: (answer: number) => void;
}

export function QuizView({ card, selectedAnswer, onSelectAnswer }: QuizViewProps) {
    const correctAnswerIndex = card.correct - 1; // Convert 1-4 to 0-based index
    const answerOptions = [card.answer_a, card.answer_b, card.answer_c, card.answer_d];
    const correctAnswer = answerOptions[correctAnswerIndex];

    return (
        <Card className="w-full p-6 flex flex-col space-y-4">
            <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Question</div>
                <div className="text-xl font-medium">{card.question}</div>
            </div>

            <div className="space-y-2">
                {answerOptions.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectAnswer(index + 1)}
                        disabled={selectedAnswer !== null}
                        className={`w-full px-4 py-2 text-left rounded-lg border transition ${
                            selectedAnswer === index + 1
                                ? answer === correctAnswer
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                : selectedAnswer !== null && answer === correctAnswer
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                        {answer}
                    </button>
                ))}
            </div>
        </Card>
    );
}
