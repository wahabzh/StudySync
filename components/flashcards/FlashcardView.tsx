"use client";

import { Flashcard } from "@/types/database";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FlashcardViewProps {
    card: Flashcard;
    isFlipped: boolean;
    onFlip: () => void;
}

export function FlashcardView({ card, isFlipped, onFlip }: FlashcardViewProps) {
    return (
        <div className="perspective-1000 w-full h-[300px] cursor-pointer" onClick={onFlip}>
            <motion.div
                className="relative w-full h-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Question Side */}
                <Card
                    className="absolute w-full h-full p-6 flex items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">Question</div>
                        <div className="text-xl font-medium">{card.question}</div>
                    </div>
                </Card>

                {/* Answer Side */}
                <Card
                    className="absolute w-full h-full p-6 flex items-center justify-center backface-hidden"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                    }}
                >
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">Answer</div>
                        <div className="text-xl font-medium whitespace-pre-wrap">{card.answer}</div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
} 