"use server";

import { prisma } from "~/lib/prisma";
import { auth } from "~/auth";
import { CloudCog } from "lucide-react";

export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createConversation(title: string = "New Chat") {
  const session = await auth();

  if (!session?.user?.id) throw new Error("Unauthorized");

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
    events: conversation.events as any,
    session: conversation.session as any,
  };
}

export async function saveConversationState(id: string, events: any, eveSession: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.conversation.updateMany({
    where: { id, userId: session.user.id },
    data: {
      events,
      session: eveSession,
    },
  });
}
