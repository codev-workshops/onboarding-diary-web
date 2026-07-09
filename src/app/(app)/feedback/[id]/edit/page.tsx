import { EntryForm } from "@/components/entries/entry-form";
import { FEEDBACK_MODULE } from "@/components/entries/config";

export default function Page({ params }: { params: { id: string } }) {
  return <EntryForm def={FEEDBACK_MODULE} id={params.id} />;
}
