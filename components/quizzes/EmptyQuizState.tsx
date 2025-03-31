import { Button } from "@/components/ui/button";
import { LayersIcon, PlusCircle } from "lucide-react";

interface EmptyQuizStateProps {
    onCreate: () => void;
}

export function EmptyQuizState({ onCreate }: EmptyQuizStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
                <LayersIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No quizzes</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
                You haven&apos;t created any quizzes yet. Create your first quiz to start studying.
            </p>
            <Button onClick={onCreate} className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Create Your First Quiz</span>
            </Button>
        </div>
    );
} 