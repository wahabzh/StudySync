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
  const pomodoroState = usePomodoroContext(); // for custom_user_goal
  const goal = pomodoroState.settings.userGoal ?? 0; // Default to 0 if null
  const progress = pomodoroState.settings.progressOnCustom ?? 0; // Default to 0 if null

  let percentage = 0;
  let progressBarColor = "bg-muted"; // Default to grey color

  if (goal !== 0) {
    percentage = Math.min(100, (progress / goal) * 100);
    progressBarColor = "bg-green-500"; // Change to green color if goal is set
  }

  return (
    <div className="flex items-center">
      {/* Outer bar */}
      <div className="relative w-[500px] h-5 bg-muted rounded-full overflow-hidden">
        {/* Filled portion */}
        <div
          className={`absolute left-0 top-0 h-full ${progressBarColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Label to the right of the bar */}
      <span className="ml-2 text-xs text-muted-foreground">
        {progress}/{goal}
      </span>
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
        <div className="flex items-center">
          {/* Left: Title */}
          <h1 className="flex-none text-lg md:text-2xl font-semibold">
            My Documents
          </h1>

          {/* Middle: Progress Bar (centered) */}
          <div className="flex-1 flex justify-center">
            <GoalProgressBar></GoalProgressBar>
          </div>

          {/* Right: Buttons */}
          <div className="flex-none flex gap-2">
            <NewDocumentDialog onCreate={createDocument} />
            <StatsDialog />
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