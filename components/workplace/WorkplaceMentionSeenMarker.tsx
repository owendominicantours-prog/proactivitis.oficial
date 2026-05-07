"use client";

import { useEffect } from "react";

type Props = {
  roomId: string;
};

export default function WorkplaceMentionSeenMarker({ roomId }: Props) {
  useEffect(() => {
    if (!roomId) return;

    void fetch("/api/workplace/chat/mentions/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId })
    }).catch(() => undefined);
  }, [roomId]);

  return null;
}
