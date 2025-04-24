'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatSidebar from './chat-sidebar'
import ChatWindow from './chat-window'
import { ChatThread } from '@/types/database'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, MessageCircle, Bot, Brain } from "lucide-react"
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


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
    function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow hover:shadow-md transition">
                <div className="text-green-600 mb-4">{icon}</div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        );
    }
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full bg-gradient-to-tr from-background to-primary/5 overflow-hidden">
            {/* <ChatWindow
                threadId={selectedThreadId}
                onCreateThread={createThread}
                threads={threads}
            /> */}
             {selectedThreadId === null ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-background text-foreground text-center p-8 overflow-y-auto">
                <h1 className="text-4xl font-bold mb-4">Welcome to StudySync Chat</h1>
                <p className="text-lg text-muted-foreground mb-6 max-w-xl">
                  Your personal AI-powered study assistant. Ask questions, get explanations, and boost your learning—anytime.
                </p>
                <Button onClick={() => createThread('New Chat', false)} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md transition mb-10">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Chatting Now
                </Button>
              
                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
                  <Card className="text-left">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                      <CardTitle>Natural Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      Chat with the AI like you're talking to a tutor — no jargon, just clarity.
                    </CardContent>
                  </Card>
              
                  <Card className="text-left">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <Brain className="w-6 h-6 text-green-600" />
                      <CardTitle>Smart Assistance</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      Get explanations, summaries, and study help tailored to your needs.
                    </CardContent>
                  </Card>
              
                  <Card className="text-left">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <Bot className="w-6 h-6 text-green-600" />
                      <CardTitle>Available 24/7</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      Whether it’s midnight or midday, StudySync Chat is always ready.
                    </CardContent>
                  </Card>
                </div>
              </div>
             ):(
            <ChatWindow
                threadId={selectedThreadId}
                onCreateThread={createThread}
                threads={threads}
            />)}
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
