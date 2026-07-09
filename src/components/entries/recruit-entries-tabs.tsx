"use client";

import { useState } from "react";
import { EntryListPage } from "@/components/entries/entry-list-page";
import {
  TASKS_MODULE,
  ISSUES_MODULE,
  FEEDBACK_MODULE,
  NOTES_MODULE,
  type ModuleDef,
} from "@/components/entries/config";

const TABS: ModuleDef[] = [
  TASKS_MODULE,
  ISSUES_MODULE,
  FEEDBACK_MODULE,
  NOTES_MODULE,
];

/** Read-only tabs over a recruit's entries (docs/UI_FLOWS.md screen #12). */
export function RecruitEntriesTabs({ userId }: { userId: string }) {
  const [active, setActive] = useState(TABS[0].module);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-1 border-b" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.module}
            role="tab"
            aria-selected={active === tab.module}
            onClick={() => setActive(tab.module)}
            className={`min-h-[44px] rounded-t px-4 py-2 text-sm font-medium ${
              active === tab.module
                ? "border border-b-0 border-slate-300 bg-white text-blue-700"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {TABS.filter((tab) => tab.module === active).map((tab) => (
          <EntryListPage key={tab.module} def={tab} userId={userId} readOnly />
        ))}
      </div>
    </div>
  );
}
