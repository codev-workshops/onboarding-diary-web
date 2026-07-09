import { EntryListPage } from "@/components/entries/entry-list-page";
import { NOTES_MODULE } from "@/components/entries/config";

export default function Page() {
  return <EntryListPage def={NOTES_MODULE} />;
}
