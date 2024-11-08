import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Index() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tighter">
          Welcome to StudySync
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Make studying easier, together.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
