'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, MessageSquare, LogOut } from 'lucide-react';
import { getConversations, createConversation } from '~/app/actions/chat';
import { signOut } from 'next-auth/react';

interface Conversation {
  id: string;
  title: string;
}

export default function Sidebar({
  currentId,
  onSelect,
}: {
  currentId: string | null;
  onSelect: (id: string) => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchConvos = async () => {
    const data = await getConversations();
    setConversations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchConvos();
  }, []);

  const handleCreateClick = () => {
    setNewTitle('New Chat');
    setIsModalOpen(true);
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newConvo = await createConversation(newTitle.trim());
      setConversations([newConvo, ...conversations]);
      onSelect(newConvo.id);
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-100 flex flex-col h-full shadow-xl">
      <div className="p-5 flex items-center justify-between border-b border-gray-800">
        <h2 className="font-bold text-xl tracking-tight">My Chats</h2>
        <button
          onClick={handleCreateClick}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <PlusCircle size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          <div className="animate-pulse flex space-x-2 p-3">
            <div className="h-4 w-4 bg-gray-700 rounded-full"></div>
            <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-6">
            No conversations yet.
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-3 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                currentId === c.id
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <MessageSquare size={18} />
              <span className="truncate">{c.title}</span>
            </button>
          ))
        )}
      </div>
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <button
          onClick={() => signOut()}
          className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white hover:bg-red-500/10 transition-colors w-full px-4 py-2.5 rounded-lg"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-gray-900">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold">New Conversation</h3>
            </div>
            <form onSubmit={submitCreate} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Conversation Title
                </label>
                <input
                  id="title"
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  placeholder="e.g. Brainstorming session"
                  disabled={isCreating}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Chat'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
