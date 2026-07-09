import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });
  if (!user) return null;
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department ?? "",
          startDate: user.startDate
            ? user.startDate.toISOString().slice(0, 10)
            : "",
        }}
      />
    </div>
  );
}
