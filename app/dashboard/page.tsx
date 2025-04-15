"use client";

import { createClient } from "@/utils/supabase/server";
import { redirect, useSearchParams, useRouter, usePathname } from "next/navigation";
import { Document } from "@/types/database";
import { createDocument, getUser } from "@/app/actions";
import NewDocumentDialog from "@/components/new-document-dialog";
import StatsDialog from "@/components/stats-dialog-box";
import { DocumentCard } from "@/components/document-card";
import { DocumentFilters } from "@/components/document-filters";
import { formatDistanceToNow } from "date-fns";
import { Suspense, useCallback, useEffect, useState } from "react";
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
  onDocumentDeleted,
}: {
  documents: Document[];
  userId: string;
  onDocumentDeleted: (documentId: string) => void;
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
          onDeleted={() => onDocumentDeleted(document.id)}
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

// Create a separate client component for the filtered content
function FilteredContent({ userId }: { userId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get the filter from URL or default to 'owned'
  const filter = searchParams.get('filter') || 'owned';

  // Update URL when filter changes
  const handleFilterChange = (newFilter: string) => {
    if (newFilter === 'owned') {
      // Remove the filter parameter for the default view
      router.replace(pathname);
    } else {
      router.replace(`${pathname}?filter=${newFilter}`);
    }
  };

  // Handle document deletion
  const handleDocumentDeleted = useCallback((documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  }, []);

  return (
    <>
      <DocumentFilters
        setDocuments={setDocuments}
        userId={userId}
        filterprop={filter}
        onFilterChange={handleFilterChange}
        setLoading={setLoading}
      />
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[180px] rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState />
        ) : (
          <DocumentGrid 
            documents={documents} 
            userId={userId} 
            onDocumentDeleted={handleDocumentDeleted} 
          />
        )}
      </div>
    </>
  );
}

export default function HomePage() {
  const [userId, setUserId] = useState<string>("");
  const [showCongrats, setShowCongrats] = useState(false);
  const pomodoroState = usePomodoroContext();

  useEffect(() => {
    getUser().then(async ({ id, username, custom_user_goal, progress_on_custom }) => {
      setUserId(id);
      sessionStorage.setItem("username", username);

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
        <CongratsDialog open={showCongrats} setOpen={setShowCongrats} userId={userId} />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">My Documents</h1>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex gap-2 self-end md:self-auto">
              <NewDocumentDialog onCreate={createDocument} />
              <StatsDialog />
            </div>
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <FilteredContent userId={userId} />
        </Suspense>
      </div>
    )
  );
}