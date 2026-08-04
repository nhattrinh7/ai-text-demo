'use client';

import { useEveAgent } from 'eve/react';
import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { HandleMessageStreamEvent, SessionState } from 'eve/client';

import { getSharedConversation } from '~/app/actions/chat';

export default function SharedChatArea({
  conversationId,
}: {
  conversationId: string | null;
}) {
  const [dbData, setDbData] = useState<{
    events: readonly HandleMessageStreamEvent[];
    session?: SessionState;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    getSharedConversation(conversationId).then((data) => {
      if (!data) {
        setError('Conversation not found or not accessible.');
        setLoading(false);
        return;
      }
      setDbData({
        events: (data?.events as HandleMessageStreamEvent[]) ?? [],
        session:
          data?.session && Object.keys(data.session as SessionState).length > 0
            ? (data.session as SessionState)
            : undefined,
      });
      setLoading(false);
    });
  }, [conversationId]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Shared Chat
          </h3>
          <p className="text-gray-500">
            Invalid conversation ID.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !dbData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <ActiveSharedChat
      initialEvents={dbData.events}
      initialSession={dbData.session}
    />
  );
}

function ActiveSharedChat({
  initialEvents,
  initialSession,
}: {
  initialEvents: readonly HandleMessageStreamEvent[];
  initialSession?: SessionState;
}) {
  const { data, send, status, error } = useEveAgent({
    initialEvents,
    initialSession,
    onFinish(snapshot) {
      console.log('Read-only mode: State not saved to DB.', snapshot);
    },
  });

  const [input, setInput] = useState('');
  const messages = data?.messages || [];
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    send({ message: input });
    setInput('');
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative border-l">
      {/* Banner Read-Only */}
      <div className="bg-orange-100 text-orange-800 px-4 py-2 text-center text-sm font-semibold border-b border-orange-200">
        You are viewing a shared chat in Read-Only mode. Try sending a message to see the continuationToken error!
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 text-center text-sm font-semibold border-b border-red-200">
          Eve Server Error: {error.message}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 mt-10">
            Empty shared conversation.
          </div>
        )}
        {messages.map((m) => {
          const hasVisibleParts = m.parts.some((p) => p.type !== 'step-start');
          if (!hasVisibleParts) return null;

          return (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {m.parts.map((p, i) => {
                  if (p.type === 'text') return <span key={i}>{p.text}</span>;
                  if (p.type === 'reasoning')
                    return (
                      <div key={i} className="text-sm opacity-70 italic mt-1">
                        {p.text}
                      </div>
                    );
                  if (p.type === 'dynamic-tool')
                    return (
                      <div key={i} className="mt-1">
                        <div className="text-sm text-blue-700 font-semibold italic">
                          [Tool: {p.toolName}]
                        </div>
                      </div>
                    );
                  if (p.type === 'authorization')
                    return (
                      <div
                        key={i}
                        className="text-sm text-orange-600 italic mt-1"
                      >
                        [Auth: {(p as { displayName?: string }).displayName}]
                      </div>
                    );
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
        <form
          onSubmit={handleSubmit}
          className="flex space-x-2 max-w-4xl mx-auto"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-full border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition px-5 py-3 outline-none text-gray-800"
            placeholder="Type your message to test Read-Only..."
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
