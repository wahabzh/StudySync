// This is now a Server Component
import ChatLayout from '@/components/chat/chat-layout'

export default async function ChatThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
    const { threadId } = await params
    return (
        <ChatLayout selectedThreadId={threadId} />
    )
}