"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-700">Log in</h2>
      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}
      <label className="block text-sm">
        <span className="text-slate-600">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-slate-300 p-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Password</span>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded border border-slate-300 p-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
