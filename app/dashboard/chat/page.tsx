// app/dashboard/chat/page.tsx
'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send } from "lucide-react"

export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    })

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5" />
                <h1 className="text-2xl font-bold">StudySync Knowledge Base</h1>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
                {messages.length === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <p>Welcome to StudySync Knowledge Base! I can help you with your study materials, documents, flashcards, and quizzes.</p>
                            <p className="mt-2">Try asking me a question about your study materials.</p>
                        </CardContent>
                    </Card>
                )}

                {messages.map(message => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} max-w-[80%]`}>
                            <p>{message.content}</p>
                        </div>
                    </div>
                ))}

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