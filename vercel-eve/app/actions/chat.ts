'use server';

import { prisma } from '~/lib/prisma';
import { auth } from '~/auth';
import { Prisma } from '@prisma/client';
import type { HandleMessageStreamEvent, SessionState } from 'eve/client';

export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createConversation(title: string = 'New Chat') {
  const session = await auth();

  if (!session?.user?.id) throw new Error('Unauthorized');

  const conversation = await prisma.conversation.create({
    data: {
      title,
      userId: session.user.id,
    },
  });

  return conversation;
}

export async function getConversationById(id: string) {
  const session = await auth();

  if (!session?.user?.id) return null;

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!conversation) return null;

  return {
    ...conversation,
    events: conversation.events as unknown as HandleMessageStreamEvent[],
    session: conversation.session as unknown as SessionState,
  };
}

export async function saveConversationState(
  id: string,
  events: HandleMessageStreamEvent[],
  eveSession: SessionState
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.conversation.updateMany({
    where: { id, userId: session.user.id },
    data: {
      events: events as unknown as Prisma.InputJsonValue,
      session: eveSession as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function getSharedConversation(id: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) return null;

  const rawEvents = (conversation.events as unknown as HandleMessageStreamEvent[]) || [];
  
  // Filter out session.waiting events which might leak the continuationToken
  const scrubbedEvents = rawEvents.filter(event => event.type !== 'session.waiting');

  const rawSession = (conversation.session as unknown as SessionState) || {};
  
  // Omit continuationToken from session
  const scrubbedSession: SessionState = {
    ...rawSession,
    continuationToken: undefined
  };

  return {
    ...conversation,
    events: scrubbedEvents,
    session: scrubbedSession,
  };
}
