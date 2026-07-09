"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FieldErrors = Record<string, string>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFields({});
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setPending(false);
    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message ?? "Registration failed");
      setFields(data?.error?.fields ?? {});
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-700">Sign up</h2>
      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}
      <label className="block text-sm">
        <span className="text-slate-600">Name</span>
        <input
          name="name"
          required
          className="mt-1 w-full rounded border border-slate-300 p-2"
        />
        {fields.name && <p className="mt-1 text-xs text-red-600">{fields.name}</p>}
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-slate-300 p-2"
        />
        {fields.email && (
          <p className="mt-1 text-xs text-red-600">{fields.email}</p>
        )}
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Password</span>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded border border-slate-300 p-2"
        />
        {fields.password && (
          <p className="mt-1 text-xs text-red-600">{fields.password}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          At least 8 characters with a letter and a digit.
        </p>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
