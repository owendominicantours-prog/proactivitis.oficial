"use client";

import { ChatBox } from "@/components/ChatBox";
import { ConversationList } from "@/components/conversations/ConversationList";
import { useState } from "react";

export default function SupplierChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-6 py-10">
      <div className="w-1/3">
        <ConversationList onSelect={(conv) => setConversationId(conv.id)} selectedId={conversationId ?? undefined} typeFilter="RESERVATION" />
      </div>
      <div className="w-2/3">
        <ChatBox conversationId={conversationId ?? undefined} />
      </div>
    </div>
  );
}
