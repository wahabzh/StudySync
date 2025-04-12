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
                "w-64 border-r bg-background flex-shrink-0 hidden md:flex flex-col",
            )}>
                {/* Sidebar Header */}
                <div className="p-4 border-b">
                    <Button
                        onClick={() => setShowNewChatDialog(true)}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        New Chat
                    </Button>
                </div>

                {/* Threads List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loadingThreads ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No chats yet
                        </div>
                    ) : (
                        threads.map(thread => (
                            <div
                                key={thread.id}
                                className={cn(
                                    "group flex items-center gap-2 rounded-md p-2 text-sm",
                                    "hover:bg-muted/50 cursor-pointer transition-colors",
                                    selectedThreadId === thread.id && "bg-muted"
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
                                                className="h-7 text-xs"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
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
                                                className="h-6 w-6"
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
                                            <MessageCircle className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                            {thread.title}
                                        </span>
                                    )}
                                </Link>

                                {editingThreadId !== thread.id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingThreadId(thread.id)
                                                    setEditThreadTitle(thread.title)
                                                }}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => onDeleteThread(thread.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t">
                    <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center gap-2 text-destructive hover:text-destructive"
                                disabled={threads.length === 0 || deletingAllThreads}
                            >
                                {deletingAllThreads ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                                Clear All Chats
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. All your chat threads and messages will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAllThreads}>
                                    Delete All
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Mobile sidebar button */}
            <div className="md:hidden fixed bottom-20 left-4 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-12 w-12 shadow-md border"
                    onClick={() => setIsMobileSidebarOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Mobile sidebar dialog */}
            <Dialog open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 h-[80vh]">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>Your Chats</DialogTitle>
                        <Button
                            onClick={() => {
                                setShowNewChatDialog(true)
                                setIsMobileSidebarOpen(false)
                            }}
                            className="w-full mt-2 flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            New Chat
                        </Button>
                    </DialogHeader>

                    {/* Mobile threads list - implementation similar to desktop */}
                    {/* ... (similar to desktop implementation) */}
                </DialogContent>
            </Dialog>

            {/* New Chat Dialog */}
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Chat</DialogTitle>
                        <DialogDescription>
                            Give your new chat a title
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Chat title"
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
                            <Label htmlFor="new-chat-general-knowledge">
                                Use general knowledge
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateThread} disabled={isCreatingThread}>
                            {isCreatingThread ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Chat'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}