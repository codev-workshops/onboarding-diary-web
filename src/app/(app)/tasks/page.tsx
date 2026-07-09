import { EntryListPage } from "@/components/entries/entry-list-page";
import { TASKS_MODULE } from "@/components/entries/config";

export default function Page() {
  return <EntryListPage def={TASKS_MODULE} />;
}
