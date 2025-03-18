import { Sidebar } from "@/components/sidebar/sidebar"
import ChatInterface from "@/components/chat/chat-interface"
import { KnowledgeFileSidebar } from "@/components/sidebar/KnowledgeFileSidebar"

export default function ChatPage() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <ChatInterface />
      <KnowledgeFileSidebar />
    </main>
  )
}

