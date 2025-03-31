"use client";

import { useState, useEffect, useCallback } from "react";
import { Quiz } from "@/types/database";
import { getQuizzes } from "@/app/quizzes";
import { QuizCard } from "@/components/quizzes/QuizCard";
import { QuizFilters } from "@/components/quizzes/QuizFilters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { EmptyQuizState } from "@/components/quizzes/EmptyQuizState";

export function CardList() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("updated_desc");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Load decks with current filters
    const loadQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedQuizzes = await getQuizzes(searchQuery, sortBy);
            setQuizzes(fetchedQuizzes);
        } catch (error) {
            console.error("Error loading quizzes:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, sortBy]);

    // Load decks on initial render and when filters change
    useEffect(() => {
        loadQuizzes();
    }, [loadQuizzes]);

    // Refresh decks when URL changes (modal closes)
    useEffect(() => {
        const handleRouteChange = () => {
            // Check if we're on the decks page without any modal params
            if (pathname === "/dashboard/quizzes" &&
                !searchParams.has("create") &&
                !searchParams.has("edit") &&
                !searchParams.has("study")) {
                loadQuizzes();
            }
        };

        // Call once on mount
        handleRouteChange();

        // Listen for URL changes
        window.addEventListener("popstate", handleRouteChange);
        return () => {
            window.removeEventListener("popstate", handleRouteChange);
        };
    }, [pathname, searchParams, loadQuizzes]);

    // Handle creating a new deck
    const handleCreateQuiz = () => {
        // Update URL to show create modal
        const params = new URLSearchParams(searchParams);
        params.set("create", "true");
        router.push(`/dashboard/quizzes?${params.toString()}`);
    };

    // Handle studying a deck
    const handleStudyQuiz = (quizId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("study", quizId);
        router.push(`/dashboard/quizzes?${params.toString()}`);
    };

    // Handle editing a deck
    const handleEditQuiz = (quizId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("edit", quizId);
        router.push(`/dashboard/quizzes?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
                <Button onClick={handleCreateQuiz} className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Quiz</span>
                </Button>
            </div>

            <QuizFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-[180px] rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse"
                        />
                    ))}
                </div>
            ) : quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onStudy={() => handleStudyQuiz(quiz.id)}
                            onEdit={() => handleEditQuiz(quiz.id)}
                            onRefresh={loadQuizzes}
                        />
                    ))}
                </div>
            ) : (
                <EmptyQuizState onCreate={handleCreateQuiz} />
            )}
        </div>
    );
}