'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, ArrowRight, Bot, User, Sparkles, Brain } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import { cn } from "@/lib/utils"
import { getUserProfileImage } from "@/app/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChatThread, ChatMessage } from "@/types/database"
import { useToast } from '@/hooks/use-toast'
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

const starterPrompts = [
    "What's in my notes about web development?",
    "Explain the flashcards I created for data structures",
    "Quiz me on my machine learning questions",
    "Summarize my study materials on React hooks",
];

interface ChatWindowProps {
    threadId: string | null
    onCreateThread: (title: string, useGeneralKnowledge: boolean) => Promise<string | null>
    threads: ChatThread[]
}

export default function ChatWindow({ threadId, onCreateThread, threads }: ChatWindowProps) {
    const router = useRouter()
    const [useGeneralKnowledge, setUseGeneralKnowledge] = useState(false)
    const { toast } = useToast()

    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
        api: '/api/chat',
        body: {
            useGeneralKnowledge,
            threadId,
        },
        id: threadId || undefined,
    })

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [userAvatar, setUserAvatar] = useState<string | null>(null)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)

    // Load thread settings and messages when thread changes
    useEffect(() => {
        if (threadId) {
            const thread = threads.find(t => t.id === threadId)
            if (thread) {
                setUseGeneralKnowledge(thread.use_general_knowledge)
            }

            // Load messages for this thread
            loadThreadMessages(threadId)
        } else {
            // Clear messages when no thread is selected
            setMessages([])
        }
    }, [threadId, threads])

    // Load messages for a specific thread
    const loadThreadMessages = async (threadId: string) => {
        setIsLoadingMessages(true)
        try {
            const response = await fetch(`/api/chat/threads/${threadId}`)

            if (response.status === 404) {
                /*toast({
                    variant: "destructive",
                    title: "Thread not found",
                    description: "This chat thread may have been deleted"
                })*/
                router.push('/dashboard/chat/new')
                return
            }

            if (!response.ok) throw new Error('Failed to fetch thread messages')

            const data = await response.json()

            if (data.messages && data.messages.length > 0) {
                // Format messages for the chat UI
                const formattedMessages = data.messages.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                }))
                setMessages(formattedMessages)
            }
        } catch (error) {
            console.error('Error loading thread messages:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load chat messages"
            })
            router.push('/dashboard/chat/new')
        } finally {
            setIsLoadingMessages(false)
        }
    }

    // Fetch user avatar
    useEffect(() => {
        getUserProfileImage().then(avatarUrl => {
            setUserAvatar(avatarUrl)
        })
    }, [])

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Update general knowledge setting
    const toggleGeneralKnowledge = async (checked: boolean) => {
        setUseGeneralKnowledge(checked)

        // Update thread setting if a thread is selected
        if (threadId) {
            try {
                await fetch(`/api/chat/threads/${threadId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ useGeneralKnowledge: checked })
                })
            } catch (error) {
                console.error('Error updating general knowledge setting:', error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update knowledge setting"
                })
            }
        }
    }

    const handlePromptClick = (prompt: string) => {
        setInput(prompt)
    }

    const handleSubmitWithThread = async (e: React.FormEvent) => {
        e.preventDefault()

        // If no thread exists, create one first
        if (!threadId) {
            const newThreadId = await onCreateThread('New Chat', useGeneralKnowledge)
            if (newThreadId) {
                // After creating the thread, navigate to it and set input
                const tempInput = input
                router.push(`/dashboard/chat/${newThreadId}`)

                // Give time for the router to update and chat state to initialize
                setTimeout(() => {
                    setInput(tempInput)
                    handleSubmit(e as any)
                }, 100)
            }
        } else {
            handleSubmit(e)
        }
    }

    const currentThread = threads.find(t => t.id === threadId)

    return (
        <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-background/40">
            {/* Message Thread Header */}
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        {currentThread && (
                            <>
                                <div className="flex items-center">
                                    <div className="bg-primary/10 p-1.5 rounded-md">
                                        <MessageCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <h2 className="text-lg font-medium ml-2">
                                        {currentThread.title}
                                    </h2>
                                    {currentThread.use_general_knowledge && (
                                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                            General Knowledge
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <Switch
                                id="general-knowledge"
                                checked={useGeneralKnowledge}
                                onCheckedChange={toggleGeneralKnowledge}
                                className="mr-2"
                            />
                            <Label htmlFor="general-knowledge" className="text-sm text-muted-foreground cursor-pointer">
                                Use general knowledge
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {isLoadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center px-4 py-10 space-y-8">
                        <div className="max-w-md space-y-4">
                            <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                                <Brain className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">Your Knowledge Assistant</h3>
                            <p className="text-muted-foreground">
                                Ask questions about your study materials or start a conversation to explore topics in depth.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                            {[
                                "Explain the concept of photosynthesis",
                                "Summarize my notes on World War II",
                                "What are the key points from my economics document?",
                                "Compare the flashcards from my biology deck",
                                "Help me understand this formula from my math notes",
                                "What's the relationship between these concepts?",
                            ].map((prompt) => (
                                <Button
                                    key={prompt}
                                    variant="outline"
                                    className="justify-start h-auto px-4 py-3 text-left bg-card hover:bg-accent"
                                    onClick={() => handlePromptClick(prompt)}
                                >
                                    <div className="flex">
                                        <span className="text-primary mr-2">
                                            <MessageCircle className="h-4 w-4" />
                                        </span>
                                        <span className="text-sm truncate">{prompt}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isUser = message.role === 'user'

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "mb-4 flex items-start",
                                        isUser ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[75%]",
                                            isUser
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-accent text-accent-foreground border border-accent-foreground/10"
                                        )}
                                    >
                                        <div className="flex items-center mb-1">
                                            <div
                                                className={cn(
                                                    "flex h-6 w-6 shrink-0 select-none items-center justify-center",
                                                    isUser
                                                        ? ""
                                                        : "bg-primary/10 text-primary rounded-md"
                                                )}
                                            >
                                                {isUser ? (
                                                    <Avatar className="h-6 w-6 rounded-md">
                                                        <AvatarImage src={userAvatar || ""} alt="User" />
                                                        <AvatarFallback className="bg-primary/90 text-primary-foreground font-medium rounded-md">
                                                            U
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                )}
                                            </div>
                                            <div className="ml-2 text-sm font-medium">
                                                {isUser ? 'You' : 'Knowledge Base'}
                                            </div>
                                        </div>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            {...props}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={cn(
                                                                "underline underline-offset-4",
                                                                isUser
                                                                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                                                                    : "text-blue-600 dark:text-blue-400"
                                                            )}
                                                        />
                                                    ),
                                                    p: ({ node, ...props }) => (
                                                        <p {...props} className="mb-2 last:mb-0" />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul {...props} className="list-disc pl-6 mb-2" />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol {...props} className="list-decimal pl-6 mb-2" />
                                                    ),
                                                    code: ({ node, ...props }) => (
                                                        <code {...props} className={cn(
                                                            "rounded px-1 py-0.5 font-mono text-sm",
                                                                isUser ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                                                        )} />
                                                    ),
                                                    pre: ({ node, ...props }) => (
                                                        <pre
                                                            {...props}
                                                            className="bg-muted text-muted-foreground p-3 rounded-md my-2 overflow-x-auto text-sm"
                                                        />
                                                    ),
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Box */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-4 pb-6 pt-4 border-t">
                <form onSubmit={handleSubmitWithThread} className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask about your study materials..."
                            className="pr-10 sm:pr-12 py-6 sm:py-7 border border-input/70 shadow-sm focus-visible:ring-primary/50 text-sm sm:text-base rounded-full pl-5 transition-all duration-200 focus-visible:border-primary/30"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/90 hover:bg-primary shadow-sm transition-colors"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                        </Button>
                    </div>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    {useGeneralKnowledge ?
                        "Answers will include general knowledge beyond your study materials." :
                        "Ask about your documents, flashcards, and quizzes - or any study-related question!"}
                </p>
            </div>
        </div>
    )
}