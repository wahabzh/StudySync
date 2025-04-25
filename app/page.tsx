import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, FlaskConical, Lightbulb, Sparkles, Users, Star, Check, ArrowUpRight, ArrowUp, LucideIcon } from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Index() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block">
              <Badge variant="outline" className="px-3 py-1 mb-4 border-primary/20 bg-primary/5 text-primary">
                <span className="text-xs font-medium">Fast. Collaborative. Intelligent.</span>
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Study Smarter, <span className="text-primary">Not Harder</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The all-in-one collaborative learning platform designed to elevate your study experience
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-6 group">
              <Link href="/sign-up">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 hover:bg-primary/5">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              StudySync combines powerful tools to transform how you learn, collaborate, and retain knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div id="documents" className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Documents</h3>
              <p className="text-muted-foreground">
                Create and edit rich documents with our powerful, collaborative editor that makes note-taking a breeze.
              </p>
            </div>

            {/* Feature 2 */}
            <div id="flashcards" className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Generated Flashcards</h3>
              <p className="text-muted-foreground">
                Transform your notes into effective flashcards automatically with our intelligent AI assistant.
              </p>
            </div>

            {/* Feature 3 */}
            <div id="quizzes" className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quiz Generation</h3>
              <p className="text-muted-foreground">
                Test your knowledge with automatically generated quizzes that adapt to your learning needs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
              <p className="text-muted-foreground">
                Work together with classmates in real-time, sharing documents and learning resources seamlessly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground">
                Build your personal knowledge repository that grows with you throughout your academic journey.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Productivity Tools</h3>
              <p className="text-muted-foreground">
                Stay focused with integrated pomodoro timers and track your study progress with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section - Completely Revamped */}
      <section id="community" className="py-20 px-4 md:px-6 lg:px-8 bg-muted/50 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Community-Driven</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Connect with a <span className="text-primary">Global Community</span> of Learners
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p>Access thousands of community-created study materials across various subjects</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p>Collaborate with peers studying the same subjects to enhance understanding</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-1 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p>Share your knowledge and build your academic reputation</p>
                </div>
              </div>
              <div>
                <Button asChild size="lg" className="group">
                  <Link href="/community">
                    Explore Community Resources
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-primary/40 opacity-70 blur-xl"></div>
              <div className="relative overflow-hidden rounded-xl border bg-card shadow-lg">
                <div className="px-6 py-5 border-b">
                  <Tabs defaultValue="trending">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="trending">Trending</TabsTrigger>
                      <TabsTrigger value="recent">Recent</TabsTrigger>
                      <TabsTrigger value="popular">Popular</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="divide-y">
                  <CommunityCard 
                    title="Advanced Biology Notes"
                    author="Emily Chen" 
                    subject="Biology"
                    views={1243}
                    saves={87}
                    trend={true}
                  />
                  <CommunityCard 
                    title="Calculus II Study Guide"
                    author="Michael Johnson" 
                    subject="Mathematics"
                    views={975}
                    saves={113}
                    trend={false}
                  />
                  <CommunityCard 
                    title="World History Timeline"
                    author="Sarah Williams" 
                    subject="History"
                    views={1892}
                    saves={215}
                    trend={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Completely Revamped */}
      <section className="relative py-24 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-primary">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="relative bg-background/70 backdrop-blur-sm border rounded-xl p-8 md:p-12 shadow-xl">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div className="inline-flex gap-2 items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Star className="h-4 w-4" />
                  <span>Join 10,000+ students already using StudySync</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to transform your study routine?</h2>
                <p className="text-muted-foreground text-lg">
                  Create your free account today and experience the full power of StudySync's collaborative learning platform.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full px-6 group">
                    <Link href="/sign-up">
                      Create Free Account
                      <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary/5 p-6 rounded-xl border">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-lg font-medium mb-1">Free Access</div>
                <p className="text-center text-sm text-muted-foreground max-w-[180px]">
                  No credit card required. Full feature access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="font-bold text-xl flex items-center mb-4">
                <div className="h-8 w-8 mr-2 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground">S</span>
                </div>
                StudySync
              </Link>
              <p className="text-muted-foreground max-w-md">
                The all-in-one collaborative learning platform designed to elevate your study experience. Connect, learn, and succeed together.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sign-in" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StudySync. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// UI Component for Community Cards
function CommunityCard({ 
  title, 
  author, 
  subject, 
  views, 
  saves, 
  trend 
}: { 
  title: string; 
  author: string; 
  subject: string; 
  views: number; 
  saves: number; 
  trend: boolean; 
}) {
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 h-12 w-12 rounded-md flex items-center justify-center text-primary shrink-0">
          {subject.charAt(0)}
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="font-medium text-base line-clamp-1">{title}</h4>
          <p className="text-sm text-muted-foreground">By {author}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{saves.toLocaleString()} saves</span>
            </div>
            {trend && (
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/10">
                <ArrowUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
