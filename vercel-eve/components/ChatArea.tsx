"use client";

import { useEveAgent } from "eve/react";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { HandleMessageStreamEvent, SessionState } from "eve/client";

import { getConversationById, saveConversationState } from "~/app/actions/chat";

export default function ChatArea({ conversationId }: { conversationId: string | null }) {
  const [dbData, setDbData] = useState<{ events: readonly HandleMessageStreamEvent[], session: SessionState } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    getConversationById(conversationId).then(data => {
      setDbData({
        events: (data?.events as any) ?? [],
        session: (data?.session && Object.keys(data.session as any).length > 0)
          ? (data.session as any)
          : undefined,
      });
      setLoading(false);
    });
  }, [conversationId]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Eve</h3>
          <p className="text-gray-500">Select a conversation from the sidebar or create a new one to start chatting.</p>
        </div>
      </div>
    );
  }

  if (loading || !dbData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return <ActiveChat conversationId={conversationId} initialEvents={dbData.events} initialSession={dbData.session} />;
}

function ActiveChat({ conversationId, initialEvents, initialSession }: { conversationId: string; initialEvents: readonly HandleMessageStreamEvent[]; initialSession?: SessionState }) {
  const { data, send, status } = useEveAgent({
    initialEvents,
    initialSession,
    onFinish(snapshot) {
      saveConversationState(
        conversationId,
        snapshot.events as any,
        snapshot.session as any
      );
    }
  });

  const [input, setInput] = useState("");
  const messages = data?.messages || [];
  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    send({ message: input });
    setInput("");
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 mt-10">Start a conversation!</div>
        )}
        {messages.map((m) => {
          console.log(`[ChatArea] message id=${m.id} role=${m.role} parts=`, JSON.stringify(m.parts.map(p => ({ type: p.type, text: (p as any).text, toolName: (p as any).toolName }))));

          const hasVisibleParts = m.parts.some(p => p.type !== "step-start");
          if (!hasVisibleParts) return null;

          return (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm whitespace-pre-wrap ${m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
              >
                {m.parts.map((p, i) => {
                  if (p.type === "text") return <span key={i}>{p.text}</span>;
                  if (p.type === "reasoning") return <div key={i} className="text-sm opacity-70 italic mt-1">{p.text}</div>;
                  if (p.type === "dynamic-tool") return (
                    <div key={i} className="mt-1">
                      <div className="text-sm text-blue-700 font-semibold italic">[Tool: {p.toolName}]</div>
                      <InputRequestActions part={p} send={send} />
                    </div>
                  );
                  if (p.type === "step-start") return null;
                  if (p.type === "authorization") return <div key={i} className="text-sm text-orange-600 italic mt-1">[Auth: {(p as any).displayName}]</div>;
                  return null;
                })}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none px-5 py-3.5 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-full border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition px-5 py-3 outline-none text-gray-800"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

function InputRequestActions({ part, send }: { part: any, send: any }) {
  const inputRequest = part.toolMetadata?.eve?.inputRequest;
  if (!inputRequest) return null;

  const inputResponse = part.toolMetadata?.eve?.inputResponse;
  const selectedOption = inputRequest.options?.find(
    (option: any) => option.id === inputResponse?.optionId,
  );

  const [textInput, setTextInput] = useState("");

  if (inputResponse) {
    return (
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">{inputRequest.prompt}</p>
        <p className="text-sm font-medium mt-1 text-gray-800">
          Responded: {selectedOption?.label ?? inputResponse.text ?? inputResponse.optionId}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-sm text-yellow-800 mb-2">{inputRequest.prompt}</p>
      <div className="flex flex-wrap gap-2">
        {inputRequest.options?.map((option: any) => (
          <button
            key={option.id}
            onClick={() => {
              send({
                inputResponses: [{ optionId: option.id, requestId: inputRequest.requestId }],
              });
            }}
            className={`px-3 py-1.5 text-sm rounded-md transition ${option.style === "danger"
                ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {inputRequest.allowFreeform && (
        <div className="mt-3 flex gap-2">
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                send({
                  inputResponses: [{ text: textInput.trim(), requestId: inputRequest.requestId }],
                });
              }
            }}
            disabled={!textInput.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
