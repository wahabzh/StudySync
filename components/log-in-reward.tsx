"use client";

import { Star, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { checkDailyReward } from "@/app/gamification";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
      <DialogContent className="mt-4 bg-gradient-to-b from-background to-primary/5 border-primary/20 shadow-lg overflow-hidden p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
        
        <div className="relative z-10 p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Congratulations!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center items-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
                  <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 p-8 rounded-full relative z-10 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                    <Star className="h-16 w-16 text-white drop-shadow-md" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <p className="text-lg text-center font-medium">
                You've earned <span className="font-bold text-primary">10 points</span> for your daily login!
              </p>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Keep the streak going to earn bonus rewards!
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="pt-2"
            >
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
                onClick={() => setOpen(false)}
              >
                Claim Reward
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
