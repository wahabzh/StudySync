'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    MessageCircle,
    Plus,
    Trash2,
    Edit,
    X,
    Check,
    MoreVertical,
    Loader2,
    Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatThread } from "@/types/database"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ChatSidebarProps {
    threads: ChatThread[]
    loadingThreads: boolean
    selectedThreadId: string | null
    onCreateThread: (title: string, useGeneralKnowledge: boolean) => Promise<string | null>
    onUpdateThread: (threadId: string, title: string) => Promise<void>
    onDeleteThread: (threadId: string) => Promise<void>
    onDeleteAllThreads: () => Promise<void>
}

export default function ChatSidebar({
    threads,
    loadingThreads,
    selectedThreadId,
    onCreateThread,
    onUpdateThread,
    onDeleteThread,
    onDeleteAllThreads
}: ChatSidebarProps) {
    const router = useRouter()
    const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
    const [editThreadTitle, setEditThreadTitle] = useState('')
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [showNewChatDialog, setShowNewChatDialog] = useState(false)
    const [newThreadTitle, setNewThreadTitle] = useState('')
    const [useGeneralKnowledge, setUseGeneralKnowledge] = useState(false)
    const [isCreatingThread, setIsCreatingThread] = useState(false)
    const [deletingAllThreads, setDeletingAllThreads] = useState(false)
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

    const handleCreateThread = async () => {
        setIsCreatingThread(true)
        try {
            await onCreateThread(newThreadTitle, useGeneralKnowledge)
            setNewThreadTitle('')
            setShowNewChatDialog(false)
        } finally {
            setIsCreatingThread(false)
        }
    }

    const handleDeleteAllThreads = async () => {
        setDeletingAllThreads(true)
        try {
            await onDeleteAllThreads()
        } finally {
            setDeletingAllThreads(false)
            setShowDeleteAllDialog(false)
        }
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn(
                "w-72 border-l bg-background/95 backdrop-blur-sm flex-shrink-0 hidden md:flex flex-col relative"
            )}>
                {/* Sidebar Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Knowledge Base</h2>
                    </div>
                    <Button
                        onClick={() => setShowNewChatDialog(true)}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors"
                    >
                        <Plus size={16} />
                        New Conversation
                    </Button>
                </div>

                {/* Threads List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loadingThreads ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <div className="flex flex-col items-center gap-2">
                                <MessageCircle className="h-10 w-10 text-muted-foreground/50" />
                                <p>No conversations yet</p>
                                <p className="text-xs text-muted-foreground/70">Start a new chat to begin building your knowledge base</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="pb-2">
                                <p className="text-xs text-muted-foreground/80 font-medium px-2 pb-2">YOUR CONVERSATIONS</p>
                                {threads.map(thread => (
                                    <div
                                        key={thread.id}
                                        className={cn(
                                            "group flex items-center gap-2 rounded-md p-2 text-sm",
                                            "hover:bg-accent cursor-pointer transition-all duration-200",
                                            selectedThreadId === thread.id
                                                ? "bg-accent shadow-sm border-l-2 border-l-primary"
                                                : "hover:border-l hover:border-l-primary/40 border-l border-l-transparent"
                                        )}
                                    >
                                        <Link
                                            href={`/dashboard/chat/${thread.id}`}
                                            className="flex-1 truncate"
                                            onClick={() => setIsMobileSidebarOpen(false)}
                                        >
                                            {editingThreadId === thread.id ? (
                                                <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                                                    <Input
                                                        value={editThreadTitle}
                                                        onChange={(e) => setEditThreadTitle(e.target.value)}
                                                        className="h-7 text-xs focus-visible:ring-primary/40"
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                            onUpdateThread(thread.id, editThreadTitle)
                                                            setEditingThreadId(null)
                                                        }}
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                            setEditingThreadId(null)
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="flex items-center">
                                                    <MessageCircle className={cn(
                                                        "h-3.5 w-3.5 mr-2",
                                                        selectedThreadId === thread.id ? "text-primary" : "text-muted-foreground"
                                                    )} />
                                                    <span className={cn(
                                                        selectedThreadId === thread.id ? "text-foreground font-medium" : "text-foreground/80",
                                                        "transition-colors duration-200"
                                                    )}>
                                                        {thread.title}
                                                    </span>
                                                    {thread.use_general_knowledge && (
                                                        <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px]">
                                                            General
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </Link>

                                        {editingThreadId !== thread.id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditingThreadId(thread.id)
                                                            setEditThreadTitle(thread.title)
                                                        }}
                                                    >
                                                        <Edit className="h-3.5 w-3.5 mr-2" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => onDeleteThread(thread.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Footer */}
                {threads.length > 0 && (
                    <div className="p-3 border-t bg-card/40">
                        <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear all conversations
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete all your chat threads and conversations.
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAllThreads}
                                        className="bg-destructive hover:bg-destructive/90"
                                        disabled={deletingAllThreads}
                                    >
                                        {deletingAllThreads && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Delete All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-0 z-50 flex flex-col bg-background md:hidden",
                isMobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
                "transition-opacity duration-200"
            )}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">Knowledge Base</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    {loadingThreads ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No conversations yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {threads.map(thread => (
                                <div
                                    key={thread.id}
                                    className={cn(
                                        "group flex items-center gap-2 rounded-md p-2 text-sm",
                                        "hover:bg-accent cursor-pointer transition-colors",
                                        selectedThreadId === thread.id ? "bg-accent" : ""
                                    )}
                                >
                                    <Link
                                        href={`/dashboard/chat/${thread.id}`}
                                        className="flex-1 truncate"
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                    >
                                        <span className="flex items-center">
                                            <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span className={selectedThreadId === thread.id ? "font-medium" : ""}>
                                                {thread.title}
                                            </span>
                                        </span>
                                    </Link>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingThreadId(thread.id)
                                                    setEditThreadTitle(thread.title)
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => onDeleteThread(thread.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t">
                    <Button
                        onClick={() => {
                            setShowNewChatDialog(true)
                            setIsMobileSidebarOpen(false)
                        }}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        New Conversation
                    </Button>
                </div>
            </div>

            {/* Floating button for mobile */}
            <Button
                className="fixed left-4 bottom-4 h-10 px-3 md:hidden z-40 shadow-lg"
                onClick={() => setIsMobileSidebarOpen(true)}
                variant="outline"
                size="sm"
            >
                <Menu className="h-5 w-5 mr-2" />
                Chats
            </Button>

            {/* Dialog for creating new thread */}
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Conversation</DialogTitle>
                        <DialogDescription>
                            Start a conversation with your knowledge base
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Conversation title"
                            value={newThreadTitle}
                            onChange={(e) => setNewThreadTitle(e.target.value)}
                            className="w-full"
                        />
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="new-chat-general-knowledge"
                                checked={useGeneralKnowledge}
                                onCheckedChange={(checked) => setUseGeneralKnowledge(checked === true)}
                            />
                            <Label htmlFor="new-chat-general-knowledge" className="flex items-center gap-1">
                                Use general knowledge
                                <span className="text-xs text-muted-foreground">(includes info beyond your study materials)</span>
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            onClick={handleCreateThread}
                            disabled={isCreatingThread}
                            className="w-full sm:w-auto"
                        >
                            {isCreatingThread && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Conversation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}