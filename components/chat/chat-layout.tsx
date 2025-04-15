'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatSidebar from './chat-sidebar'
import ChatWindow from './chat-window'
import { ChatThread } from '@/types/database'
import { useToast } from '@/hooks/use-toast'

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
            {/* <ChatWindow
                threadId={selectedThreadId}
                onCreateThread={createThread}
                threads={threads}
            /> */}
            <ChatSidebar
                threads={threads}
                loadingThreads={loadingThreads}
                selectedThreadId={selectedThreadId}
                onCreateThread={createThread}
                onUpdateThread={updateThread}
                onDeleteThread={deleteThread}
                onDeleteAllThreads={deleteAllThreads}
            />
            <ChatWindow
                threadId={selectedThreadId}
                onCreateThread={createThread}
                threads={threads}
            />
        </div>
    )
}
