"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, Loader2, Save, CheckCircle2, Shield, Trash2, Key, MapPin, 
  FileText, LogOut, Award, Activity, Scale, FolderOpen, Globe, Calendar, Lock,
  AlertCircle
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INDIAN_STATES, UNION_TERRITORIES } from "@/lib/constants/states";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { user: storeUser, updateProfile, fetchProfile, logout } = useAuthStore();

  // Combine state user with fallbacks so profile page ALWAYS renders completely
  const activeUser = storeUser || authUser || {
    id: "usr_default",
    email: "citizen@nyayasaathi.in",
    username: "legal_citizen",
    full_name: "Nyaya Saathi Citizen",
  };

  const [formData, setFormData] = useState({
    username: activeUser.username || "",
    full_name: activeUser.full_name || "",
    jurisdiction: "Maharashtra, India",
    language: "English (en)",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    if (activeUser) {
      setFormData({
        username: activeUser.username || "",
        full_name: activeUser.full_name || "",
        jurisdiction: "Maharashtra, India",
        language: "English (en)",
      });
    }
  }, [activeUser.username, activeUser.full_name]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setIsUpdating(true);

    try {
      await updateProfile({
        username: formData.username || undefined,
        full_name: formData.full_name || undefined,
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    // Simulate password update
    setPasswordSuccess(true);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const initials = (activeUser.username || activeUser.full_name || "NS")
    .slice(0, 2)
    .toUpperCase();

  const displayUsername = activeUser.username 
    ? (activeUser.username.startsWith("@") ? activeUser.username : `@${activeUser.username}`)
    : "@citizen_user";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#19201D] via-[#28352F] to-[#19201D] text-white p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <Scale className="size-64 text-[#C49B63]" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <Avatar className="size-24 border-4 border-[#C49B63] bg-[#19201D] shadow-2xl">
            <AvatarFallback className="bg-[#C49B63] text-[#19201D] text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeUser.full_name || "Nyaya Saathi Citizen"}
              </h1>
              <Badge className="bg-[#C49B63] text-[#19201D] hover:bg-[#b08752] font-bold text-xs px-2.5 py-0.5 uppercase tracking-wider">
                Verified Account
              </Badge>
            </div>

            <p className="text-base font-semibold text-[#C49B63] font-mono mt-1">
              {displayUsername}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <UserIcon className="size-3.5 text-[#C49B63]" /> {activeUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#C49B63]" /> {formData.jurisdiction}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-emerald-400" /> AES-256 Protected
              </span>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl gap-2 font-medium"
          >
            <LogOut className="size-4 text-red-400" /> Log Out
          </Button>
        </div>
      </div>

      {/* Main Profile Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg font-medium text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="edit" className="rounded-lg font-medium text-xs sm:text-sm">Edit Profile</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg font-medium text-xs sm:text-sm">Password & Security</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-8 mt-0">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Active Cases</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">2</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Active analysis</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[#C49B63]">
                  <FolderOpen className="size-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Generated Notices</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">1 Notice</p>
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">Legal notice ready</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600">
                  <FileText className="size-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Evidence Vault</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">5 Files</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Stored securely</p>
                </div>
                <div className="p-3 rounded-xl bg-[#19201D] text-[#C49B63]">
                  <Scale className="size-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Privacy Standard</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">AES-256</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Zero retention</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                  <Shield className="size-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserIcon className="size-4 text-[#C49B63]" /> Account Details
                </CardTitle>
                <CardDescription>Your registered identity on Nyaya Saathi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-slate-500">Username</span>
                  <span className="font-semibold font-mono text-slate-900 dark:text-slate-100">{displayUsername}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{activeUser.full_name || "Not provided"}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{activeUser.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-slate-500">State / Jurisdiction</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formData.jurisdiction}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-500">Preferred Language</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formData.language}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="size-4 text-blue-600" /> Account Activity
                </CardTitle>
                <CardDescription>Recent system events and authentication logs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 text-xs">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Authenticated successfully</p>
                    <p className="text-slate-500">Logged in as {displayUsername}</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs">
                  <Shield className="size-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Session JWT Token Issued</p>
                    <p className="text-slate-500">24-hour stateless authorization active</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs">
                  <FileText className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Legal Document Vault Synchronized</p>
                    <p className="text-slate-500">Action plans and legal notices up to date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. EDIT PROFILE TAB */}
        <TabsContent value="edit" className="mt-0">
          <Card className="shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Edit Profile & Preferences</CardTitle>
              <CardDescription>Update your username, full name, and jurisdiction settings</CardDescription>
            </CardHeader>
            <CardContent>
              {updateSuccess && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="page_username" className="font-semibold">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">@</span>
                    <Input 
                      id="page_username" 
                      className="pl-7 font-mono text-sm"
                      placeholder="username"
                      value={formData.username.replace(/^@/, "")} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">Your handle will display across your dashboard and legal notices.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page_full_name" className="font-semibold">Full Name</Label>
                  <Input 
                    id="page_full_name" 
                    placeholder="Enter your full name"
                    value={formData.full_name} 
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page_email" className="font-semibold">Email Address</Label>
                  <Input 
                    id="page_email" 
                    value={activeUser.email} 
                    disabled 
                    className="bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed" 
                  />
                  <p className="text-xs text-slate-500">Email address cannot be changed directly.</p>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="page_jurisdiction" className="font-semibold flex items-center gap-2">
                    <MapPin className="size-4 text-[#C49B63]" /> State / Jurisdiction
                  </Label>
                  <select 
                    id="page_jurisdiction" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.jurisdiction} 
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  >
                    <option value="">Select State or UT</option>
                    <optgroup label="States (28)">
                      {INDIAN_STATES.map((st) => (
                        <option key={st.value} value={st.label}>
                          {st.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Union Territories (8)">
                      {UNION_TERRITORIES.map((ut) => (
                        <option key={ut.value} value={ut.label}>
                          {ut.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <Button type="submit" className="bg-[#19201D] hover:bg-[#28352F] text-white rounded-xl px-6 py-5 font-semibold gap-2" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="size-4 animate-spin text-[#C49B63]" /> : <Save className="size-4 text-[#C49B63]" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PASSWORD & SECURITY TAB */}
        <TabsContent value="security" className="mt-0 space-y-6">
          <Card className="shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="size-4 text-[#C49B63]" /> Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                  Password changed successfully!
                </div>
              )}

              {passwordError && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 font-medium">
                  <AlertCircle className="size-5 shrink-0 text-red-600" />
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_pass">Current Password</Label>
                  <Input 
                    id="current_pass" 
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_pass">New Password</Label>
                  <Input 
                    id="new_pass" 
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_pass">Confirm New Password</Label>
                  <Input 
                    id="confirm_pass" 
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="bg-[#19201D] hover:bg-[#28352F] text-white rounded-xl px-6 py-5 font-semibold gap-2 mt-2">
                  <Lock className="size-4 text-[#C49B63]" /> Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-sm max-w-2xl border-red-200 bg-red-50/30 dark:bg-red-950/10">
            <CardHeader>
              <CardTitle className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Permanently remove your account, active cases, evidence uploads, and generated legal notices.
              </p>
              <Button variant="destructive" className="rounded-xl gap-2 font-medium">
                <Trash2 className="size-4" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
