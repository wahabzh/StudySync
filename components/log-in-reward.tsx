"use client";

import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { checkDailyReward } from "@/app/gamification";

interface CongratsDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
}

export default function CongratsDialog({
  open,
  setOpen,
  userId,
}: CongratsDialogProps) {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    async function fetchDailyReward() {
      const shouldShow = await checkDailyReward(userId);
      if (shouldShow) {
        setShowDialog(true);
      }
    }
    fetchDailyReward();
  }, [userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="mt-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Congratulations!
          </DialogTitle>
        </DialogHeader>
        <p className="text-lg text-center mt-2">
          You have received <strong>10 points</strong> for your daily login.
        </p>
        <div className="flex justify-center items-center mt-4">
          <Star className="h-24 w-24 text-yellow-500" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
