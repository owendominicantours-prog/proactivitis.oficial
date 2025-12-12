"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ChatBox } from "@/components/ChatBox";
import { ConversationList } from "@/components/ConversationList";

export default function ChatPage() {
  const { data, error } = useSWR("/api/conversations", fetcher, { refreshInterval: 5000 });
  const conversations = data?.conversations ?? [];
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const activeConversationId = selectedId ?? conversations[0]?.id;

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <ConversationList
            conversations={conversations}
            selectedId={activeConversationId}
            onSelect={setSelectedId}
          />
          <div className="lg:col-span-2">
            <ChatBox conversationId={activeConversationId} />
          </div>
        </div>
      </div>
    </div>
  );
}
