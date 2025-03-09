"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile, getUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Upload, User, Mail, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Maximum file size in bytes (800KB)
const MAX_FILE_SIZE = 800 * 1024;

export default function ProfilePage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [initialValues, setInitialValues] = useState({ username: "", email: "", description: "", avatarUrl: "" });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const { toast } = useToast();
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    // Check if form has changed from initial values
    useEffect(() => {
        const hasChanged =
            username !== initialValues.username ||
            email !== initialValues.email ||
            description !== initialValues.description ||
            avatarFile !== null;

        setIsFormChanged(hasChanged);
    }, [username, email, description, avatarFile, initialValues]);

    async function fetchProfile() {
        setIsLoading(true);
        try {
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
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load profile data"
            });
        } finally {
            setIsLoading(false);
        }
    }

    function handleCancel() {
        setUsername(initialValues.username);
        setEmail(initialValues.email);
        setDescription(initialValues.description);
        setAvatarUrl(initialValues.avatarUrl);
        setAvatarFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setFileError(null);

        if (file) {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setFileError(`File size exceeds 800KB. Current size: ${(file.size / 1024).toFixed(2)}KB`);
                // Reset the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return;
            }

            setAvatarFile(file);
            setAvatarUrl(URL.createObjectURL(file));
        }
    }

    async function handleConfirmSubmit() {
        setIsLoading(true);
        formRef.current?.requestSubmit();

        await fetchProfile();

        setIsLoading(false);
        setIsDialogOpen(false);

        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
            duration: 3000,
        });
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and profile information.
                </p>
            </div>

            <form ref={formRef} action={updateProfile} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>
                            This will be displayed on your profile and in the dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="w-24 h-24 border-2 border-muted">
                                <AvatarImage src={avatarUrl} alt="Profile Picture" />
                                <AvatarFallback className="text-2xl">
                                    {username ? username.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="relative">
                                    <Input
                                        ref={fileInputRef}
                                        name="avatar_file"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className={`pl-10 ${fileError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                                {fileError ? (
                                    <p className="text-xs text-red-500 font-medium">
                                        {fileError}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: Square JPG or PNG, max 800KB
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal details and contact information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Username
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Bio
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us a bit about yourself"
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading || !isFormChanged}
                    >
                        Reset
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                disabled={isLoading || !isFormChanged}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Changes</DialogTitle>
                            </DialogHeader>
                            <p>Are you sure you want to update your profile?</p>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirmSubmit} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Confirm"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <button type="submit" hidden />
            </form>
        </div>
    );
}
