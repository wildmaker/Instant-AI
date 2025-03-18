import { Sidebar } from "@/components/sidebar/sidebar"
import { KnowledgeFileSidebar } from "@/components/sidebar/KnowledgeFileSidebar"
import { ChatInterface } from "@/components/chat/ChatInterface"

export default function ChatPage() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <ChatInterface />
      <KnowledgeFileSidebar />
    </main>
  )
}

