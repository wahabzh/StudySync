"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile, getUser } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { useEffect} from "react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function fetchProfile() {
          const userData = await getUser();
          setProfile(userData);
        }
        fetchProfile();
      }, []);
    
    //const profile = await getUser();
  /*const [formData, setFormData] = useState({
    username: profile?.username || "",
    email: profile?.email || "",
    password: "",
    description: profile?.description || "",
    avatarFile: null,
  });*/

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarImage src={profile?.avatar_url || "/twitter-image.png"} alt="Profile Picture" />
          <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <Input name = "avatar_url" type="file" accept="image/*" />
      </div>

      {/* Profile Info */}
      <form>
      <h2 className="text-2xl font-semibold">{profile?.username || "User"}</h2>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label>Username</Label>
            <Input name="username" defaultValue={profile?.username}/>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" name="email" defaultValue={profile?.email} required/>
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" name="password" defaultValue="......." required/>
          </div>
          <div>
            <Label>Description</Label>
            <Input name="description" defaultValue={profile?.description} />
          </div>
          {/*<Button onClick={handleSubmit} className="w-full">Update Profile</Button>*/}
          <SubmitButton formAction={updateProfile}>
                Update Profile
          </SubmitButton>
        </CardContent>
      </Card>
      </form>
    </div>
  );
}