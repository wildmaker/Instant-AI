import { Sidebar } from "@/components/sidebar/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { TopicSidebar } from "@/components/sidebar/topic-sidebar"

export default function ChatPage() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <ChatInterface />
      <TopicSidebar />
    </main>
  )
}

