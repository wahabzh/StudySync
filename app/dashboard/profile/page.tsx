"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile, getUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [initialValues, setInitialValues] = useState({
    username,
    email,
    description,
    avatarUrl,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const userData = await getUser();
    setUsername(userData.username || "");
    setEmail(userData.email || "");
    setDescription(userData.description || "");
    setAvatarUrl(userData.avatar_url || "");

    setInitialValues({
      username: userData.username || "",
      email: userData.email || "",
      description: userData.description || "",
      avatarUrl: userData.avatar_url || "",
    });
  }

  function handleReset(e: React.MouseEvent) {
    setIsLoading(true);
    setUsername(initialValues.username);
    setEmail(initialValues.email);
    setDescription(initialValues.description);
    setPassword("");
    setAvatarUrl(initialValues.avatarUrl);
    setAvatarFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLoading(false);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  }

  async function handleConfirmSubmit() {
    // formRef.current?.requestSubmit();
    try {
      setIsLoading(true);
      await updateProfile(new FormData(formRef.current!));
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        duration: 3000,
        className: "bottom-right-toast",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form ref={formRef}>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarUrl} alt="Profile Picture" />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <Input
            ref={fileInputRef}
            name="avatar_file"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>

        <h2 className="text-2xl font-semibold">My Profile</h2>
        <br />
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Reset"
                )}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button">Update Profile</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Changes</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to save these changes?</p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
