// app/dashboard/chat/page.tsx
'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, ArrowRight } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
const starterPrompts = [
    "What's in my notes about web development?",
    "Explain the flashcards I created for data structures",
    "Quiz me on my machine learning questions",
    "Summarize my study materials on React hooks",
];

export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
        api: '/api/chat',
    })

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5" />
                <h1 className="text-2xl font-bold">StudySync Knowledge Base</h1>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
                {messages.length === 0 ? (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-lg font-medium mb-2">Welcome to StudySync Knowledge Base!</h2>
                                <p>I can help you with your study materials, documents, flashcards, and quizzes.</p>
                                <p className="mt-2">Try asking me a question about your materials or select one of the suggestions below.</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {starterPrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="justify-between h-auto py-3 px-4 text-left"
                                    onClick={() => handlePromptClick(prompt)}
                                >
                                    <span className="line-clamp-2">{prompt}</span>
                                    <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map(message => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} max-w-[80%]`}>
                                {message.role === 'user' ? (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return match ? (
                                                    <SyntaxHighlighter
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-4 bg-muted rounded-lg max-w-[80%]">
                            <p>Thinking...</p>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about your study materials..."
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                </Button>
            </form>
        </div>
    )
}