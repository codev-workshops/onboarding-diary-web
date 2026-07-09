/* Seed script — demo users and sample entries (docs/REQUIREMENTS.md, G2 scope).
   Run with: npm run seed */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "Passw0rd!";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  await prisma.managerAssignment.deleteMany();
  await prisma.taskEntry.deleteMany();
  await prisma.issueEntry.deleteMany();
  await prisma.feedbackEntry.deleteMany();
  await prisma.noteEntry.deleteMany();
  await prisma.user.deleteMany();

  const mkUser = (
    email: string,
    name: string,
    role: string,
    department: string,
    startDaysAgo: number,
  ) =>
    prisma.user.create({
      data: {
        email,
        name,
        role,
        department,
        startDate: daysAgo(startDaysAgo),
        passwordHash,
      },
    });

  await mkUser("admin@demo.co", "Ada Admin", "ADMIN", "People Ops", 400);
  const mgr1 = await mkUser("manager1@demo.co", "Mia Manager", "MANAGER", "Engineering", 300);
  const mgr2 = await mkUser("manager2@demo.co", "Max Mentor", "MANAGER", "Product", 280);
  const rec1 = await mkUser("recruit1@demo.co", "Rita Recruit", "RECRUIT", "Engineering", 21);
  const rec2 = await mkUser("recruit2@demo.co", "Ravi Rookie", "RECRUIT", "Engineering", 14);
  const rec3 = await mkUser("recruit3@demo.co", "Nina Newhire", "RECRUIT", "Product", 10);
  const rec4 = await mkUser("recruit4@demo.co", "Finn Fresh", "RECRUIT", "Product", 5);

  await prisma.managerAssignment.createMany({
    data: [
      { managerId: mgr1.id, recruitId: rec1.id },
      { managerId: mgr1.id, recruitId: rec2.id },
      { managerId: mgr2.id, recruitId: rec3.id },
      { managerId: mgr2.id, recruitId: rec4.id },
    ],
  });

  await prisma.taskEntry.createMany({
    data: [
      { authorId: rec1.id, date: daysAgo(20), title: "Set up dev environment", description: "Install toolchain and clone repos", category: "SETUP", status: "DONE", priority: "HIGH" },
      { authorId: rec1.id, date: daysAgo(12), title: "Complete security training", category: "TRAINING", status: "IN_PROGRESS", priority: "MEDIUM" },
      { authorId: rec1.id, date: daysAgo(2), title: "Read architecture docs", category: "DOCUMENTATION", status: "TODO", priority: "LOW" },
      { authorId: rec2.id, date: daysAgo(10), title: "Meet the team", description: "1:1s with each teammate", category: "MEETING", status: "DONE", priority: "MEDIUM" },
      { authorId: rec2.id, date: daysAgo(3), title: "First bug fix", category: "GENERAL", status: "BLOCKED", priority: "HIGH" },
      { authorId: rec3.id, date: daysAgo(7), title: "Product overview session", category: "TRAINING", status: "DONE", priority: "MEDIUM" },
      { authorId: rec4.id, date: daysAgo(1), title: "Request laptop peripherals", category: "SETUP", status: "TODO", priority: "LOW" },
    ],
  });

  await prisma.issueEntry.createMany({
    data: [
      { authorId: rec1.id, date: daysAgo(15), title: "VPN access denied", description: "Cannot reach internal wiki", severity: "HIGH", status: "RESOLVED", resolutionNotes: "IT granted access after ticket #4711" },
      { authorId: rec2.id, date: daysAgo(3), title: "Blocked on repo permissions", description: "No write access to main service repo", severity: "CRITICAL", status: "OPEN" },
      { authorId: rec3.id, date: daysAgo(5), title: "Slack channels unclear", severity: "LOW", status: "IN_PROGRESS" },
    ],
  });

  await prisma.feedbackEntry.createMany({
    data: [
      { authorId: rec1.id, date: daysAgo(14), subject: "Great buddy system", type: "POSITIVE", details: "Having an assigned buddy made week one much smoother." },
      { authorId: rec2.id, date: daysAgo(6), subject: "Onboarding docs outdated", type: "CONCERN", details: "Several setup guides reference tools we no longer use." },
      { authorId: rec4.id, date: daysAgo(2), subject: "Add a checklist for week 1", type: "SUGGESTION", details: "A standard week-1 checklist would remove guesswork." },
    ],
  });

  await prisma.noteEntry.createMany({
    data: [
      { authorId: rec1.id, date: daysAgo(18), title: "Team glossary", content: "CDW = corporate data warehouse; LTV = loan-to-value…", tags: "glossary,reference" },
      { authorId: rec3.id, date: daysAgo(4), title: "Questions for 1:1", content: "Ask about quarterly goals and demo cadence.", tags: "meetings" },
    ],
  });

  console.log("Seeded: 1 admin, 2 managers, 4 recruits, 15 entries.");
  console.log(`All demo accounts use password: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
