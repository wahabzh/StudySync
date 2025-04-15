"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import {
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  Brain,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Frame,
  LifeBuoy,
  LogOut,
  Map,
  MoreHorizontal,
  PieChart,
  Pin,
  Send,
  Settings,
  Settings2,
  Share,
  Sparkles,
  SquareTerminal,
  Trash2,
  User,
  Users,
  Zap,
  MessageCircle,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { signOutAction } from "../actions";

import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";
import { PomodoroProvider } from "@/contexts/pomodoro-context";
import Link from "next/link";
import { Profile } from "@/types/database";
import {
  getProfileData,
  getUserDocumentsLatestFiveSideBar,
  getSharedDocumentsLatestFiveSideBar,
  getCommunityDocumentsLatestFiveSideBar
} from "@/app/sidebar";
import { useEffect, useState } from "react";
import { getUser } from "@/app/actions";
import { usePathname } from "next/navigation";
import React from "react";

// profile tab

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [CurUser, setUser] = useState<Profile | null>(null);
  const [UserNotes, setUserNotes] = useState([
    {
      title: "Notes",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [], // Initially empty, will be populated dynamically
    },
    // Other sections like Flashcards, Shared, etc.
  ]);

  const [SharedNotes, setSharedNotes] = useState([
    {
      title: "Notes",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [], // Initially empty, will be populated dynamically
    },
    // Other sections like Flashcards, Shared, etc.
  ]);

  const [CommunityNotes, setCommunityNotes] = useState([
    {
      title: "Notes",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [], // Initially empty, will be populated dynamically
    },
    // Other sections like Flashcards, Shared, etc.
  ]);

  const pathname = usePathname();

  // Generate breadcrumb items based on the current path
  const getBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean);

    // Default breadcrumb for dashboard
    if (paths.length === 1 && paths[0] === 'dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard', current: true }];
    }

    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard', current: false }
    ];

    let currentPath = '/dashboard';

    // Skip 'dashboard' as it's already added
    for (let i = 1; i < paths.length; i++) {
      const path = paths[i];
      currentPath += `/${path}`;

      // Handle document IDs
      if (path === 'doc' && i < paths.length - 1) {
        breadcrumbs.push({
          label: 'Document',
          href: currentPath + `/${paths[i + 1]}`,
          current: i === paths.length - 2
        });
        i++; // Skip the ID in the next iteration
        continue;
      }

      // Handle special cases
      let label = path.charAt(0).toUpperCase() + path.slice(1);

      if (path === 'decks') label = 'Flashcards';
      if (path === 'quizzes') label = 'Quizzes';
      if (path === 'community') label = 'Community';
      if (path === 'profile') label = 'Settings';

      breadcrumbs.push({
        label,
        href: currentPath,
        current: i === paths.length - 1
      });
    }

    return breadcrumbs;
  };

  const breadcrumbItems = getBreadcrumbItems();

  useEffect(() => {
    // Fetch user data
    getProfileData()
      .then((data) => {
        if (data) setUser(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  useEffect(() => {
    if (CurUser) {
      // Fetch user profile data - no need to update profile separately as we already have it in CurUser
      // The previous code was trying to use setUserProfile which doesn't exist

      // Fetch latest ten documents for the user
      getUserDocumentsLatestFiveSideBar(CurUser.id)
        .then((documents) => {
          const formattedNotes = documents.map((doc) => ({
            title: doc.title,
            url: `/dashboard/doc/${doc.id}`,
            icon: ChevronRight, // Default or appropriate icon
            isActive: false, // Default inactive state
            items: [], // No nested items for notes
          }));
          setUserNotes(formattedNotes);
        })
        .catch((error) => console.error("Error fetching documents:", error));
    }
  }, [CurUser]);

  useEffect(() => {
    if (CurUser) {
      // Fetch latest ten documents for the user
      getSharedDocumentsLatestFiveSideBar(CurUser.id)
        .then((documents) => {
          const formattedNotes = documents.map((doc) => ({
            title: doc.title,
            url: `/dashboard/doc/${doc.id}`,
            icon: ChevronRight, // Default or appropriate icon
            isActive: false, // Default inactive state
            items: [], // No nested items for notes
          }));
          setSharedNotes(formattedNotes);
        })
        .catch((error) => console.error("Error fetching documents:", error));
    }
  }, [CurUser]);

  useEffect(() => {
    if (CurUser) {
      // Fetch latest ten documents for the user
      getCommunityDocumentsLatestFiveSideBar(CurUser.id)
        .then((documents) => {
          const formattedNotes = documents.map((doc) => ({
            title: doc.title,
            url: `/dashboard/community/doc/${doc.id}`,
            icon: ChevronRight, // Default or appropriate icon
            isActive: false, // Default inactive state
            items: [], // No nested items for notes
          }));
          setCommunityNotes(formattedNotes);
        })
        .catch((error) => console.error("Error fetching documents:", error));
    }
  }, [CurUser]);

  const data = {
    user: {
      name: CurUser?.username,
      email: CurUser?.email,
      avatar: CurUser?.avatar_url || "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Documents",
        url: "/dashboard/?filter=owned",
        icon: SquareTerminal,
        isActive: false,
        items: UserNotes,
      },
      {
        title: "Shared",
        url: "/dashboard/?filter=shared", // Changed from "#" to proper route
        icon: BookOpen,
        items: SharedNotes,
      },
      {
        title: "Community",
        url: "/dashboard/community",
        icon: Users,
        items: CommunityNotes,
      },
    ],
    navSecondary: [
      {
        title: "Flashcards",
        url: "/dashboard/decks",
        icon: Zap,
      },
      {
        title: "Quizzes",
        url: "/dashboard/quizzes",
        icon: Brain,
      },
      {
        title: "Knowledge Base",
        url: "/dashboard/chat",
        icon: MessageCircle,
      },
      {
        title: "Settings",
        url: "/dashboard/profile",
        icon: Settings,
      },
    ],
  };
  return (
    <PomodoroProvider>
      <SidebarProvider>
        <Sidebar variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center justify-between">
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/dashboard">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
                      <Command className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">StudySync</span>
                      <span className="truncate text-xs">Student</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
                <ThemeSwitcher />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.items?.length ? (
                        <>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                              <ChevronRight />
                              <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </>
                      ) : null}
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.navSecondary.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild size="sm">
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <PomodoroTimer />
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={CurUser?.avatar_url || "default.jpg"}
                          alt="User"
                        />
                        <AvatarFallback className="rounded-lg">
                          <User />
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {CurUser?.username}
                        </span>
                        {/* <span className="truncate text-xs">
                          {CurUser?.email}
                        </span> */}
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={CurUser?.avatar_url || "default.jpg"}
                            alt="User"
                          />
                          <AvatarFallback className="rounded-lg">
                            <User />
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {CurUser?.username}
                          </span>
                          <span className="truncate text-xs">
                            {CurUser?.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem onSelect={signOutAction}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={item.href}>
                      <BreadcrumbItem>
                        {item.current ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href}>
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbItems.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </PomodoroProvider>
  );
}
