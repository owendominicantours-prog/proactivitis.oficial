"use client";

import { ChatBox } from "@/components/ChatBox";
import { ConversationList } from "@/components/conversations/ConversationList";
import { useState } from "react";

export default function AdminChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  return (
    <div className="mx-auto flex h-[calc(100vh-170px)] max-w-6xl gap-6 px-6 py-6">
      <div className="w-1/3 overflow-y-auto">
        <ConversationList onSelect={(conv) => setConversationId(conv.id)} selectedId={conversationId ?? undefined} />
      </div>
      <div className="w-2/3 min-h-0">
        <ChatBox conversationId={conversationId ?? undefined} enableTourCards />
      </div>
    </div>
  );
}
