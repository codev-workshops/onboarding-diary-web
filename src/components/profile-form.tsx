"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({
  initial,
}: {
  initial: {
    name: string;
    email: string;
    role: string;
    department: string;
    startDate: string;
  };
}) {
  const router = useRouter();
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        department: (form.get("department") as string) || null,
        startDate: (form.get("startDate") as string) || null,
      }),
    });
    if (res.ok) {
      setProfileMsg("Profile saved.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setProfileMsg(data?.error?.message ?? "Failed to save profile");
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMsg(null);
    const el = e.currentTarget;
    const form = new FormData(el);
    const res = await fetch("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      }),
    });
    if (res.ok) {
      setPasswordMsg("Password changed.");
      el.reset();
    } else {
      const data = await res.json().catch(() => null);
      setPasswordMsg(data?.error?.message ?? "Failed to change password");
    }
  }

  const input =
    "mt-1 w-full rounded border border-slate-300 p-2 disabled:bg-slate-100";

  return (
    <div className="mt-4 space-y-8">
      <form onSubmit={saveProfile} className="space-y-4 rounded bg-white p-6 shadow-sm">
        {profileMsg && <p className="text-sm text-slate-600">{profileMsg}</p>}
        <label className="block text-sm">
          <span className="text-slate-600">Email (read-only)</span>
          <input value={initial.email} disabled className={input} />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">Role (read-only)</span>
          <input value={initial.role} disabled className={input} />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">Name</span>
          <input name="name" defaultValue={initial.name} required className={input} />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">Department</span>
          <input name="department" defaultValue={initial.department} className={input} />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">Start date</span>
          <input name="startDate" type="date" defaultValue={initial.startDate} className={input} />
        </label>
        <button className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Save profile
        </button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 rounded bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-700">Change password</h2>
        {passwordMsg && <p className="text-sm text-slate-600">{passwordMsg}</p>}
        <label className="block text-sm">
          <span className="text-slate-600">Current password</span>
          <input name="currentPassword" type="password" required className={input} />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">New password</span>
          <input name="newPassword" type="password" required className={input} />
        </label>
        <button className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Change password
        </button>
      </form>
    </div>
  );
}
