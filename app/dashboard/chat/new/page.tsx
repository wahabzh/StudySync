'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatLayout from '@/components/chat/chat-layout'

export default function NewChatPage() {
    return (
        <ChatLayout selectedThreadId={null} />
    )
}