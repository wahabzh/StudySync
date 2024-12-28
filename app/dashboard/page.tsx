import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Document } from "@/types/database";
import { createDocument } from "@/app/actions";
import NewDocumentDialog from "@/components/new-document-dialog";
import { DocumentCard } from "@/components/document-card";
import { DocumentFilters } from "@/components/document-filters";
import { formatDistanceToNow } from "date-fns";
import { DocumentListContainer } from "@/components/document-list-container";

const EmptyState = () => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">No documents found.</p>
      <NewDocumentDialog onCreate={createDocument} />
    </div>
  );
};

const DocumentGrid = ({
  documents,
  user,
}: {
  documents: Document[];
  user: any;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          id={document.id}
          title={document.title}
          lastEdited={formatDistanceToNow(new Date(document.updated_at), {
            addSuffix: true,
          })}
          isSharedWithMe={document.owner_id !== user?.id}
          isSharedWithOthers={
            document.share_status === "anyone-with-link" ||
            (document.editors?.length ?? 0) > 0 ||
            (document.viewers?.length ?? 0) > 0
          }
        />
      ))}
    </div>
  );
};

const getDocuments = async (
  userId: string,
  filters: string[] = [],
  search?: string,
  sort: string = "updated_desc"
) => {
  const supabase = await createClient();
  let query = supabase.from("documents").select("*");

  // First, get all documents user has access to
  query = query.or(
    `owner_id.eq.${userId},editors.cs.{${userId}},viewers.cs.{${userId}}`
  );

  // Then apply filters if any are selected
  if (filters.length > 0) {
    if (filters.includes("shared_with_me")) {
      query = query.not("owner_id", "eq", userId);
    }
    if (filters.includes("shared_with_others")) {
      query = query
        .eq("owner_id", userId)
        .or("share_status.eq.anyone-with-link,editors.neq.{},viewers.neq.{}");
    }
    if (filters.includes("private")) {
      query = query
        .eq("owner_id", userId)
        .eq("share_status", "invite-only")
        .is("editors", null)
        .is("viewers", null);
    }
  }

  // Apply search
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  // Apply sorting - map sort values to actual column names
  const [field, direction] = sort.split("_");
  const sortField =
    field === "updated"
      ? "updated_at"
      : field === "created"
        ? "created_at"
        : field;

  query = query.order(sortField, { ascending: direction === "asc" });

  const { data: documents, error } = await query;

  if (error) {
    console.error("Error fetching documents:", error);
    return [] as Document[];
  }

  return documents as Document[];
};

export default async function HomePage(props: {
  searchParams: Promise<{ search?: string; filters?: string; sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const filters = searchParams.filters?.split(",").filter(Boolean) ?? [];
  const documents = await getDocuments(
    user.id,
    filters,
    searchParams.search,
    searchParams.sort
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">My Documents</h1>
        <NewDocumentDialog onCreate={createDocument} />
      </div>
      <DocumentListContainer activeFilters={filters}>
        <div className="flex flex-col gap-4">
          {documents.length === 0 ? (
            <EmptyState />
          ) : (
            <DocumentGrid documents={documents} user={user} />
          )}
        </div>
      </DocumentListContainer>
    </div>
  );
}
