import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listAssignments, listTemplates } from "@/lib/checklists";
import { ChecklistManage } from "@/components/checklists/checklist-manage";
import { RecruitChecklists } from "@/components/checklists/recruit-checklists";

export const dynamic = "force-dynamic";

export default async function ChecklistsPage() {
  const session = await auth();
  const user = session!.user;
  const sessionUser = { id: user.id, role: user.role };

  if (user.role === "RECRUIT") {
    const assignments = await listAssignments(sessionUser);
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My checklists</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tick off items as you complete your onboarding steps.
        </p>
        <RecruitChecklists initialAssignments={assignments} />
      </div>
    );
  }

  const [templates, assignments, recruits] = await Promise.all([
    listTemplates(),
    listAssignments(sessionUser),
    user.role === "MANAGER"
      ? prisma.managerAssignment
          .findMany({
            where: { managerId: user.id },
            include: { recruit: { select: { id: true, name: true } } },
            orderBy: { createdAt: "asc" },
          })
          .then((rows) => rows.map((r) => r.recruit))
      : prisma.user.findMany({
          where: { role: "RECRUIT" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">
        Onboarding checklists
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Create checklist templates and assign them to recruits.
      </p>
      <ChecklistManage
        initialTemplates={templates}
        initialAssignments={assignments}
        recruits={recruits}
      />
    </div>
  );
}
