"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, X, Loader2, Save, CheckCircle2, Shield, Trash2, Key, MapPin, 
  FileText, LogOut, Award, Activity, Scale, FolderOpen, Globe, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { INDIAN_STATES, UNION_TERRITORIES } from "@/lib/constants/states";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSheet({ isOpen, onClose }: ProfileSheetProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { user: storeUser, updateProfile, fetchProfile, logout } = useAuthStore();

  // Combine state user with fallbacks to guarantee profile is never blank
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

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile().catch(() => {});
    }
  }, [isOpen, fetchProfile]);

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

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/auth/login");
  };

  const initials = (activeUser.username || activeUser.full_name || "NS")
    .slice(0, 2)
    .toUpperCase();

  const displayUsername = activeUser.username 
    ? (activeUser.username.startsWith("@") ? activeUser.username : `@${activeUser.username}`)
    : "@citizen_user";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Profile Dashboard Drawer */}
          <motion.div
            key="profile-sheet"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50/80 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#19201D] text-[#C49B63]">
                  <UserIcon className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Profile Dashboard</h2>
                  <p className="text-xs text-slate-500">Manage account & preferences</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="size-5" />
              </Button>
            </div>

            {/* Profile Hero Header Banner */}
            <div className="p-6 bg-gradient-to-br from-[#19201D] to-[#28352F] text-white border-b border-slate-800">
              <div className="flex items-start gap-4">
                <Avatar className="size-16 border-2 border-[#C49B63] bg-[#19201D] shadow-lg">
                  <AvatarFallback className="bg-[#C49B63] text-[#19201D] text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white truncate">
                      {activeUser.full_name || "Legal Citizen"}
                    </h3>
                    <Badge className="bg-[#C49B63] text-[#19201D] hover:bg-[#b08752] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                      Verified User
                    </Badge>
                  </div>

                  <p className="text-sm font-semibold text-[#C49B63] font-mono mt-0.5">
                    {displayUsername}
                  </p>

                  <p className="text-xs text-slate-300 truncate mt-1">
                    {activeUser.email}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-[#C49B63]" /> {formData.jurisdiction}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <TabsTrigger value="dashboard" className="text-xs rounded-lg font-medium">Dashboard</TabsTrigger>
                  <TabsTrigger value="edit" className="text-xs rounded-lg font-medium">Edit Info</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs rounded-lg font-medium">Security</TabsTrigger>
                </TabsList>

                {/* 1. DASHBOARD TAB */}
                <TabsContent value="dashboard" className="space-y-6 mt-0">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Active Cases</span>
                        <FolderOpen className="size-4 text-[#C49B63]" />
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">2</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">In active analysis</p>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Notices Drafted</span>
                        <FileText className="size-4 text-blue-600" />
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">1</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Legal notice ready</p>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Evidence Vault</span>
                        <Scale className="size-4 text-amber-600" />
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">5 Files</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Encrypted at rest</p>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Rights Status</span>
                        <Shield className="size-4 text-emerald-600" />
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Protected</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">AES-256 standard</p>
                    </div>
                  </div>

                  {/* Account Summary Details Card */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Summary</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500">Username</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{displayUsername}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500">Full Name</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{activeUser.full_name || "Not set"}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500">Email Address</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{activeUser.email}</span>
                      </div>

                      <div className="flex justify-between py-1 text-xs">
                        <span className="text-slate-500">Jurisdiction</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.jurisdiction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Log */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Activity</h4>
                    <div className="p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/20 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>Logged in as <strong className="font-mono text-slate-900 dark:text-slate-100">{displayUsername}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Activity className="size-3.5 text-blue-500 shrink-0" />
                        <span>Active session token generated</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. EDIT PROFILE TAB */}
                <TabsContent value="edit" className="space-y-6 mt-0">
                  {updateSuccess && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="size-4 shrink-0" />
                      Profile updated successfully!
                    </div>
                  )}

                  <form id="sheet-profile-form" onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sheet_username">Username</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">@</span>
                        <Input 
                          id="sheet_username" 
                          className="pl-7 font-mono"
                          placeholder="your_username"
                          value={formData.username.replace(/^@/, "")} 
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">Your unique public identifier across Nyaya Saathi.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sheet_full_name">Full Name</Label>
                      <Input 
                        id="sheet_full_name" 
                        placeholder="John Doe"
                        value={formData.full_name} 
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sheet_email">Email Address</Label>
                      <Input 
                        id="sheet_email" 
                        value={activeUser.email} 
                        disabled 
                        className="bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed" 
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Label htmlFor="sheet_jurisdiction" className="flex items-center gap-2">
                        <MapPin className="size-4 text-[#C49B63]" /> State / Jurisdiction
                      </Label>
                      <select 
                        id="sheet_jurisdiction" 
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

                    <Button type="submit" className="w-full bg-[#19201D] hover:bg-[#28352F] text-white mt-4 rounded-xl py-5 font-medium" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin text-[#C49B63]" /> : <Save className="mr-2 size-4 text-[#C49B63]" />}
                      Save Profile Changes
                    </Button>
                  </form>
                </TabsContent>

                {/* 3. SECURITY TAB */}
                <TabsContent value="security" className="space-y-5 mt-0">
                  <div className="p-4 border rounded-xl space-y-3 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      <Key className="size-4 text-[#C49B63]" /> Password & Credentials
                    </div>
                    <p className="text-xs text-slate-500">
                      Change your password or manage active session tokens.
                    </p>
                    <Button variant="outline" size="sm" className="w-full rounded-lg">
                      Change Password
                    </Button>
                  </div>

                  <div className="p-4 border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-400 text-sm">
                      <Shield className="size-4" /> End-to-End Encryption
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      All your uploaded evidence, legal notices, and case records are encrypted using standard AES-256 encryption. We adhere strictly to zero retention for private AI analysis.
                    </p>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      className="w-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl py-5 font-semibold gap-2"
                    >
                      <LogOut className="size-4 text-red-500" />
                      Log Out of Account
                    </Button>

                    {/* Danger Zone */}
                    <div className="p-4 border border-red-200 bg-red-50/50 dark:border-red-950 dark:bg-red-950/20 rounded-xl mt-6 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400 text-xs">
                        Danger Zone
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Permanently delete your account and all associated cases.
                      </p>
                      <Button variant="destructive" size="sm" className="w-full gap-2 rounded-lg text-xs mt-2">
                        <Trash2 className="size-3.5" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
