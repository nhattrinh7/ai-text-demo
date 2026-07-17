"use client";

import { useState } from "react";
import Sidebar from "~/components/Sidebar";
import ChatArea from "~/components/ChatArea";

export default function ClientPage() {
  const [currentId, setCurrentId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentId={currentId} onSelect={setCurrentId} />
      <ChatArea key={currentId || "empty"} conversationId={currentId} />
    </div>
  );
}
