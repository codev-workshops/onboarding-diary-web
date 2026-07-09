import { EntryForm } from "@/components/entries/entry-form";
import { NOTES_MODULE } from "@/components/entries/config";

export default function Page({ params }: { params: { id: string } }) {
  return <EntryForm def={NOTES_MODULE} id={params.id} />;
}
