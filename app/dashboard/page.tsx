import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Document } from "@/types/database";

const EmptyState = () => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">No documents found.</p>
      <Button>Create your first document</Button>
    </div>
  );
};

const DocumentList = ({ documents }: { documents: Document[] }) => {
  return (
    <div className="grid gap-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <h2 className="text-lg font-medium">{document.title}</h2>
          <Link
            href={`/dashboard/doc/${document.id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Edit
          </Link>
        </div>
      ))}
    </div>
  );
};

const getDocuments = async (userId: string) => {
  const supabase = await createClient();
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents");
    return [] as Document[];
  }

  return documents as Document[];
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const documents = await getDocuments(user.id);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">My Documents</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {documents.length === 0 ? (
            <EmptyState />
          ) : (
            <DocumentList documents={documents} />
          )}
        </div>
      </div>
    </div>
  );
}
