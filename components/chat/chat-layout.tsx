'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatSidebar from './chat-sidebar'
import ChatWindow from './chat-window'
import { ChatThread } from '@/types/database'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, MessageCircle, Brain } from "lucide-react"
import { Button } from '../ui/button'
import Link from 'next/link'

export default function ChatLayout({ selectedThreadId }: { selectedThreadId: string | null }) {
    const router = useRouter()
    const [threads, setThreads] = useState<ChatThread[]>([])
    const [loadingThreads, setLoadingThreads] = useState(true)
    const { toast } = useToast()

    // Fetch chat threads on component mount
    useEffect(() => {
        fetchThreads()
    }, [])

    // Fetch all chat threads
    const fetchThreads = async () => {
        setLoadingThreads(true)
        try {
            const response = await fetch('/api/chat/threads')
            if (!response.ok) throw new Error('Failed to fetch threads')

            const data = await response.json()
            setThreads(data.threads || [])
        } catch (error) {
            console.error('Error fetching threads:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load chat threads"
            })
        } finally {
            setLoadingThreads(false)
        }
    }

    // Create a new chat thread
    const createThread = async (title: string, useGeneralKnowledge: boolean) => {
        try {
            const response = await fetch('/api/chat/threads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title || 'New Chat',
                    useGeneralKnowledge
                })
            })

            if (!response.ok) throw new Error('Failed to create thread')

            const data = await response.json()
            setThreads(prev => [data.thread, ...prev])

            // Navigate to the new thread
            router.push(`/dashboard/chat/${data.thread.id}`)

            toast({
                title: "Success",
                description: "New chat created"
            })

            return data.thread.id
        } catch (error) {
            console.error('Error creating thread:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create new chat"
            })
            return null
        }
    }

    // Update a chat thread
    const updateThread = async (threadId: string, title: string) => {
        try {
            const response = await fetch(`/api/chat/threads/${threadId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            })

            if (!response.ok) throw new Error('Failed to update thread')

            const data = await response.json()
            setThreads(prev => prev.map(t => t.id === threadId ? data.thread : t))

            toast({
                title: "Success",
                description: "Chat renamed"
            })
        } catch (error) {
            console.error('Error updating thread:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to rename chat"
            })
        }
    }

    // Delete a chat thread
    const deleteThread = async (threadId: string) => {
        try {
            const response = await fetch(`/api/chat/threads/${threadId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete thread')

            setThreads(prev => prev.filter(t => t.id !== threadId))

            // If we deleted the current thread, navigate to a new one
            if (selectedThreadId === threadId) {
                const remainingThreads = threads.filter(t => t.id !== threadId)
                if (remainingThreads.length > 0) {
                    router.push(`/dashboard/chat/${remainingThreads[0].id}`)
                } else {
                    router.push('/dashboard/chat/new')
                }
            }

            toast({
                title: "Success",
                description: "Chat deleted"
            })
        } catch (error) {
            console.error('Error deleting thread:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete chat"
            })
        }
    }

    // Delete all chat threads
    const deleteAllThreads = async () => {
        try {
            const response = await fetch('/api/chat/threads/delete-all', {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete all threads')

            setThreads([])
            router.push('/dashboard/chat/new')

            toast({
                title: "Success",
                description: "All chats deleted"
            })
        } catch (error) {
            console.error('Error deleting all threads:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete all chats"
            })
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full bg-gradient-to-tr from-background to-primary/5 overflow-hidden">
            {selectedThreadId === null ? (
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-6 py-16 h-full flex flex-col justify-center">
                        <div className="text-center">
                            <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">StudySync AI</div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Knowledge Base
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                                Access all your learning materials in one place. Study smarter with AI-powered insights from your documents, flashcards, and quizzes.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center mb-16">
                                <Button
                                    onClick={() => createThread('New Chat', false)}
                                    className="gap-2 px-5 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white"
                                    size="lg"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Start Chatting Now
                                </Button>
                                <Button
                                    onClick={() => createThread('General Knowledge Chat', true)}
                                    className="gap-2 px-5 py-6 rounded-xl bg-background hover:bg-accent"
                                    variant="outline"
                                    size="lg"
                                >
                                    <Brain className="h-5 w-5" />
                                    Use General Knowledge
                                </Button>
                            </div>
                        </div>

                        {threads.length > 0 ? (
                            <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-8 shadow-sm">
                                <h2 className="text-2xl font-semibold mb-4">Recent Conversations</h2>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {threads.slice(0, 6).map(thread => (
                                        <Link
                                            key={thread.id}
                                            href={`/dashboard/chat/${thread.id}`}
                                            className="flex items-center gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20 group"
                                        >
                                            <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                                                <MessageCircle className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                                                {thread.title}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-8 shadow-sm text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                    <MessageCircle className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">No conversations yet</h2>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Start your first chat to begin exploring your knowledge base and get AI-powered insights.
                                </p>
                                <Button
                                    onClick={() => createThread('New Chat', false)}
                                    className="gap-2"
                                    variant="outline"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Start your first chat
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            ) : (
                <ChatWindow
                    threadId={selectedThreadId}
                    onCreateThread={createThread}
                    threads={threads}
                />
            )}
            <ChatSidebar
                threads={threads}
                loadingThreads={loadingThreads}
                selectedThreadId={selectedThreadId}
                onCreateThread={createThread}
                onUpdateThread={updateThread}
                onDeleteThread={deleteThread}
                onDeleteAllThreads={deleteAllThreads}
            />
        </div>
    )
}
