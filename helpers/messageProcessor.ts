import type { Message as ConversationMessage } from '../types/index.js';

interface Attachment {
  file_name: string;
  file_type: string;
  extracted_content?: string;
}

interface RawMessage {
  text?: string;
  content?: Array<{
    type: string;
    text: string;
    citations?: Array<unknown>;
  }>;
  sender: string;
  created_at: string;
  attachments?: Attachment[];
}

interface ProcessedMessage {
  id: string;
  threadId: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  updated_at: string;
}

export const messageProcessor = {
  validateAndSortMessages: (messages: RawMessage[]): RawMessage[] => {
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.created_at);
      const timeB = new Date(b.created_at);
      return timeA.getTime() - timeB.getTime();
    });

    const validatedMessages = [];
    const userMessages = sortedMessages.filter((m) => m.sender === "human");
    const assistantMessages = sortedMessages.filter(
      (m) => m.sender === "assistant"
    );
    const maxPairs = Math.min(userMessages.length, assistantMessages.length);

    for (let i = 0; i < maxPairs; i++) {
      const userMsg = userMessages[i];
      const assistantMsg = assistantMessages[i];
      validatedMessages.push(userMsg);

      const userTime = new Date(userMsg.created_at);
      const assistantTime = new Date(
        Math.max(
          userTime.getTime() + 1,
          new Date(assistantMsg.created_at).getTime()
        )
      );
      assistantMsg.created_at = assistantTime.toISOString();
      validatedMessages.push(assistantMsg);
    }

    return validatedMessages;
  },

  processMessageContent: (message: RawMessage): string => {
    let content = message.text || "";

    if ((message.attachments ?? []).length > 0) {
      message.attachments?.forEach((attachment) => {
        if (attachment.extracted_content) {
          content += `\n\n${attachment.file_name} (${attachment.file_type}):\n${attachment.extracted_content}`;
        }
      });
    }

    return content;
  },

  adjustMessageTimestamp: (
    messageTimestamp: string,
    lastMessageTimestamp: string,
    sender: string,
    lastSender: string
  ): string => {
    if (messageTimestamp === lastMessageTimestamp) {
      if (sender === "assistant" || lastSender === "human") {
        if (messageTimestamp.includes("Z")) {
          return messageTimestamp.replace("Z", "001Z");
        } else if (messageTimestamp.includes(".")) {
          const parts = messageTimestamp.split(".");
          const decimals = parts[1];
          const newDecimals =
            decimals.slice(0, -1) +
            String(Number(decimals.slice(-1)) + 1);
          return parts[0] + "." + newDecimals;
        }
        return messageTimestamp + ".001";
      }
    }
    return messageTimestamp;
  },

  validateMessages: (messages: ProcessedMessage[]): ProcessedMessage[] => {
    return messages.filter((message) => {
      return (
        message &&
        typeof message === "object" &&
        message.threadId &&
        typeof message.content === "string" &&
        message.content.length > 0 &&
        message.role
      );
    });
  },

  createMessage: (message: ConversationMessage, threadId: string): ProcessedMessage | null => {
    if (!message || !threadId) return null;

    return {
      id: crypto.randomUUID(),
      threadId: threadId,
      content: messageProcessor.processMessageContent(message as RawMessage),
      role: message.sender === 'human' ? 'user' : 'assistant',
      created_at: message.created_at,
      updated_at: message.created_at,
    };
  },
};

export type { RawMessage, Attachment, ProcessedMessage };
