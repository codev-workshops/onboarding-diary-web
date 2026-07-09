import { EntryForm } from "@/components/entries/entry-form";
import { FEEDBACK_MODULE } from "@/components/entries/config";

export default function Page() {
  return <EntryForm def={FEEDBACK_MODULE} />;
}
