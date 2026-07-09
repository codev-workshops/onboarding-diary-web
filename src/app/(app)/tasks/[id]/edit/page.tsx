import { EntryForm } from "@/components/entries/entry-form";
import { TASKS_MODULE } from "@/components/entries/config";

export default function Page({ params }: { params: { id: string } }) {
  return <EntryForm def={TASKS_MODULE} id={params.id} />;
}
