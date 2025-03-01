import { Button } from "@/components/ui/button";
import { LayersIcon, PlusCircle } from "lucide-react";

interface EmptyDeckStateProps {
    onCreate: () => void;
}

export function EmptyDeckState({ onCreate }: EmptyDeckStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
                <LayersIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No flashcard decks</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
                You haven&apos;t created any flashcard decks yet. Create your first deck to start studying.
            </p>
            <Button onClick={onCreate} className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Create Your First Deck</span>
            </Button>
        </div>
    );
} 