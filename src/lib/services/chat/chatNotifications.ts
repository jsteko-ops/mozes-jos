import { listenTrainerChats } from "@/lib/services/chat/chatService";
export function listenUnreadTrainerMessages(trainerId: string, callback: (count: number) => void) {
  return listenTrainerChats(trainerId, (chats) => callback(chats.filter((chat) => chat.unreadForTrainer === true).length));
}
