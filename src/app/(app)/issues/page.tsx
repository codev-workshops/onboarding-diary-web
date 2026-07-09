import { EntryListPage } from "@/components/entries/entry-list-page";
import { ISSUES_MODULE } from "@/components/entries/config";

export default function Page() {
  return <EntryListPage def={ISSUES_MODULE} />;
}
