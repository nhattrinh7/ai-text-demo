import SharedChatArea from '~/components/SharedChatArea';
import { getSharedConversation } from '~/app/actions/chat';
import { notFound } from 'next/navigation';

export default async function SharedChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // Optional: Pre-check if it exists so we can return a 404
  const conversation = await getSharedConversation(id);
  if (!conversation) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4 shrink-0 bg-white">
          <div className="flex items-center space-x-3 w-full">
            <span className="font-semibold text-gray-800">
              Shared Chat: {conversation.title}
            </span>
            <span className="text-sm px-2 py-1 bg-orange-100 text-orange-700 rounded-md">Read-Only</span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden relative">
          <SharedChatArea conversationId={id} />
        </div>
      </div>
    </div>
  );
}
