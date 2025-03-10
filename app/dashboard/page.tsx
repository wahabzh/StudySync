"use client";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Document } from "@/types/database";
import { createDocument, getUser } from "@/app/actions";
import NewDocumentDialog from "@/components/new-document-dialog";
import StatsDialog from "@/components/stats-dialog-box";
import { DocumentCard } from "@/components/document-card";
import { DocumentFilters } from "@/components/document-filters";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import CongratsDialog from "@/components/log-in-reward";
import { checkDailyReward } from "@/app/gamification";
import { usePomodoroContext } from "@/contexts/pomodoro-context";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">No documents found.</p>
      {/* <NewDocumentDialog onCreate={createDocument} /> */}
    </div>
  );
};

const DocumentGrid = ({
  documents,
  userId,
}: {
  documents: Document[];
  userId: string;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          id={document.id}
          title={document.title}
          lastEdited={formatDistanceToNow(new Date(document.updated_at), {
            addSuffix: true,
          })}
          isOwned={document.owner_id === userId}
          isShared={(document.editors?.includes(userId) || false) || (document.viewers?.includes(userId) || false)}
          isPublished={document.share_status === "published"}
          userId={userId}
        />
      ))}
    </div>
  );
};

function GoalProgressBar() {
  const pomodoroState = usePomodoroContext();
  const goal = pomodoroState.settings.userGoal ?? 0;
  const progress = pomodoroState.settings.progressOnCustom ?? 0;

  // Calculate percentage, ensuring it doesn't exceed 100%
  const percentage = goal > 0 ? Math.min(100, Math.round((progress / goal) * 100)) : 0;

  // Don't show if no goal is set
  if (goal === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2 w-full max-w-md">
      <div className="flex items-center justify-between w-full space-x-1">
        <span className="text-sm font-medium">Daily Goal Progress</span>
        <div className="flex items-center gap-1.5">
          {percentage >= 100 && (
            <Trophy className="h-4 w-4 text-green-500" />
          )}
          <span className="text-sm font-medium">
            {`${progress}/${goal}`}
          </span>
        </div>
      </div>

      <Progress value={percentage} className="h-2.5 w-full" />
    </div>
  );
}

export default function HomePage() {
  const [userId, setUserId] = useState<string>("");   // after refresh fix
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const pomodoroState = usePomodoroContext();


  useEffect(() => {
    getUser().then(async ({ id, username, custom_user_goal, progress_on_custom }) => {
      setUserId(id);
      sessionStorage.setItem("username", username);

      // Update Pomodoro context with persisted values
      pomodoroState.saveSettings({
        ...pomodoroState.settings,
        userGoal: custom_user_goal,
        progressOnCustom: progress_on_custom,
      });

      const shouldShow = await checkDailyReward(id);
      setShowCongrats(shouldShow);
    });
  }, []);

  return (
    userId && (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {/* Congrats Dialog */}
        <CongratsDialog open={showCongrats} setOpen={setShowCongrats} userId={userId} />

        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">My Documents</h1>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Progress Bar - Only show if goal is set */}
            {/* {pomodoroState.settings?.userGoal && pomodoroState.settings?.userGoal > 0 && (
              <GoalProgressBar />
            )} */}

            {/* Action Buttons */}
            <div className="flex gap-2 self-end md:self-auto">
              <NewDocumentDialog onCreate={createDocument} />
              <StatsDialog />
            </div>
          </div>
        </div>

        <DocumentFilters setDocuments={setDocuments} userId={userId} />
        <div className="flex flex-col gap-4">
          {documents.length === 0 ? (
            <EmptyState />
          ) : (
            <DocumentGrid documents={documents} userId={userId} />
          )}
        </div>
      </div>
    )
  );
}