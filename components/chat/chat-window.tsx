'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, ArrowRight, Bot } from "lucide-react"
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
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b">
                <div className="bg-primary/10 p-2 rounded-full">
                    <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold truncate">
                    {currentThread?.title || 'New Chat'}
                </h1>

                <div className="flex items-center space-x-2 ml-auto">
                    <Checkbox
                        id="general-knowledge"
                        checked={useGeneralKnowledge}
                        onCheckedChange={(checked) => toggleGeneralKnowledge(checked === true)}
                    />
                    <Label htmlFor="general-knowledge" className="text-sm cursor-pointer">
                        Use general knowledge
                    </Label>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-6 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                {isLoadingMessages ? (
                    <div className="flex justify-center py-8">
                        <div className="flex space-x-2">
                            <div className="h-4 w-4 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                            <div className="h-4 w-4 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-4 w-4 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="space-y-6 pt-8 max-w-3xl mx-auto">
                        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border shadow-md">
                            <CardContent className="pt-6">
                                <h2 className="text-xl font-medium mb-3">Welcome to StudySync Knowledge Base!</h2>
                                <p className="text-muted-foreground">I can help you with your study materials, documents, flashcards, and quizzes.</p>
                                <p className="mt-3 text-muted-foreground">Try asking me a question about your materials or select one of the suggestions below.</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {starterPrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="justify-between h-auto py-4 px-5 text-left hover:bg-primary/5 border shadow-sm transition-all"
                                    onClick={() => handlePromptClick(prompt)}
                                >
                                    <span className="line-clamp-2">{prompt}</span>
                                    <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0 text-primary" />
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map(message => (
                            <div key={message.id} className={cn(
                                "flex w-full",
                                message.role === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[75%]",
                                    message.role === 'user' && "flex-row-reverse"
                                )}>
                                    {/* User Avatar vs Bot Avatar */}
                                    {message.role === 'user' ? (
                                        <Avatar className="flex-shrink-0 h-8 w-8 rounded-full border">
                                            <AvatarImage src={userAvatar || ""} alt="User" />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                U
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <Avatar className="flex-shrink-0 h-8 w-8 rounded-full border bg-secondary text-secondary-foreground">
                                            <AvatarFallback>
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={cn(
                                        "p-3 sm:p-4 rounded-lg shadow-md break-words",
                                        message.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-card border rounded-tl-none"
                                    )}>
                                        {message.role === 'user' ? (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        ) : (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return match ? (
                                                            <SyntaxHighlighter
                                                                language={match[1]}
                                                                style={vscDarkPlus}
                                                                customStyle={{ margin: '1em 0', borderRadius: '8px' }}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={cn("bg-muted px-1.5 py-0.5 rounded-md text-sm", className)} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                    ul: ({ children }) => <ul className="list-disc pl-6 my-2">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal pl-6 my-2">{children}</ol>,
                                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    h3: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>,
                                                    h4: ({ children }) => <h4 className="text-base font-semibold mt-3 mb-1">{children}</h4>,
                                                    pre: ({ children }) => (
                                                        <pre className="w-full overflow-auto rounded-md my-2 bg-muted p-2 text-sm">
                                                            {children}
                                                        </pre>
                                                    ),
                                                    a: ({ href, children }) => (
                                                        <a href={href} className="text-primary underline break-words" target="_blank" rel="noopener noreferrer">
                                                            {children}
                                                        </a>
                                                    ),
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                                    <Avatar className="flex-shrink-0 h-8 w-8 rounded-full border bg-secondary text-secondary-foreground">
                                        <AvatarFallback>
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="p-4 rounded-lg shadow-md bg-card border rounded-tl-none">
                                        <div className="flex space-x-2">
                                            <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                                            <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="absolute bottom-0 left-0 right-0 bg-background md:ml-64 px-4 pb-4 pt-2 border-t">
                <form onSubmit={handleSubmitWithThread} className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask about your study materials..."
                            className="pr-10 sm:pr-12 py-5 sm:py-6 border shadow-sm focus-visible:ring-primary/50 text-sm sm:text-base"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9"
                        >
                            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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