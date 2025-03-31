import { CardList } from "@/components/quizzes/CardList";
import { QuizForm } from "@/components/quizzes/QuizForm";
import { StudyQuiz } from "@/components/quizzes/StudyQuiz";
import { Suspense } from "react";

export const metadata = {
    title: "Quizzes",
    description: "Manage and take quizzes",
};

export default function QuizPage() {
    return (
        <Suspense>
            <div className="container py-8">
                <CardList />
                <QuizForm />
                <StudyQuiz />
            </div>
        </Suspense>
    );
} 