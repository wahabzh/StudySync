"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile, getUser } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ProfilePage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(".......");
    const [description, setDescription] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [initialValues, setInitialValues] = useState({ username, email, description, avatarUrl });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
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
        fetchProfile();
    }, []);

    function handleCancel(e: React.MouseEvent) {
        e.preventDefault();
        setUsername(initialValues.username);
        setEmail(initialValues.email);
        setDescription(initialValues.description);
        setPassword(".......")
        setAvatarUrl(initialValues.avatarUrl);
        setAvatarFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarUrl(URL.createObjectURL(file));
        }
    }

    function handleConfirmSubmit() {
        setIsDialogOpen(false);
        formRef.current?.requestSubmit(); 
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <form ref={formRef} action={updateProfile}>
                <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={avatarUrl} alt="Profile Picture" />
                        <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Input ref={fileInputRef} name="avatar_file" type="file" accept="image/*" onChange={handleAvatarChange} />
                </div>

                <h2 className="text-2xl font-semibold">{username || "User"}</h2>
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div>
                            <Label>Username</Label>
                            <Input name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" required />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required />
                        </div>
                        <div>
                            <Label>Password</Label>
                            <Input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" type="button" onClick={handleCancel}>
                                Cancel
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
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleConfirmSubmit}>Confirm</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                <button type="submit" hidden />
            </form>
        </div>
    );
}
