import { EntryForm } from "@/components/entries/entry-form";
import { ISSUES_MODULE } from "@/components/entries/config";

export default function Page({ params }: { params: { id: string } }) {
  return <EntryForm def={ISSUES_MODULE} id={params.id} />;
}
