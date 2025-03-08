import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';
import type { Conversation, Message } from "./types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update file paths to be relative to project root
const conversationsPath = path.join(
  __dirname,
  "data", 
  "conversations.json"
);
const cleanedConversationsPath = path.join(
  __dirname,
  "data",
  "cleaned_conversations.json"
);

// Function to check if a chat message is empty
function isMessageEmpty(message: Message): boolean {
  return (
    !message.text &&
    (!message.content ||
      message.content.every(
        (content) =>
          !content.text &&
          (!content.citations || content.citations.length === 0)
      ))
  );
}

// Function to check if a conversation is empty
function isConversationEmpty(conversation: Conversation): boolean {
  return (
    !conversation.chat_messages ||
    conversation.chat_messages.length === 0 ||
    conversation.chat_messages.every(isMessageEmpty)
  );
}

// Function to compare two messages for content equality
function areMessagesEqual(msg1: Message, msg2: Message): boolean {
  // Compare basic message properties
  if (msg1.text !== msg2.text || msg1.sender !== msg2.sender) {
    return false;
  }

  // Compare content arrays
  if (!msg1.content || !msg2.content) {
    return false;
  }

  if (msg1.content.length !== msg2.content.length) {
    return false;
  }

  // Compare each content item
  return msg1.content.every((content1, index) => {
    const content2 = msg2.content[index];
    return (
      content1.type === content2.type &&
      content1.text === content2.text &&
      JSON.stringify(content1.citations) === JSON.stringify(content2.citations)
    );
  });
}

// Function to deduplicate messages in a conversation
function deduplicateMessages(conversation: Conversation): {
  conversation: Conversation;
  duplicatesRemoved: number;
} {
  if (!conversation.chat_messages) return { conversation, duplicatesRemoved: 0 };

  const uniqueMessages: Message[] = [];
  const originalCount = conversation.chat_messages.length;

  // Sort messages by created_at timestamp to maintain chronological order
  const sortedMessages = [...conversation.chat_messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (const message of sortedMessages) {
    // Check if this message is a duplicate of any previously seen message
    const isDuplicate = uniqueMessages.some((existingMsg) =>
      areMessagesEqual(existingMsg, message)
    );

    if (!isDuplicate) {
      uniqueMessages.push(message);
    }
  }

  conversation.chat_messages = uniqueMessages;
  // Return both the conversation and the number of duplicates removed
  return {
    conversation,
    duplicatesRemoved: originalCount - uniqueMessages.length,
  };
}

try {
  if (!fs.existsSync(conversationsPath)) {
    throw new Error(`Conversations file not found at ${conversationsPath}`);
  }

  const conversations = JSON.parse(fs.readFileSync(conversationsPath, "utf8")) as Conversation[];

  let totalDuplicatesRemoved = 0;

  // Filter out empty conversations and deduplicate messages
  const cleanedConversations = conversations
    .filter((conversation) => !isConversationEmpty(conversation))
    .map((result) => {
      const { conversation, duplicatesRemoved } = deduplicateMessages(result);
      totalDuplicatesRemoved += duplicatesRemoved;
      return conversation;
    });

  // Write the cleaned data back to the file
  fs.writeFileSync(
    cleanedConversationsPath,
    JSON.stringify(cleanedConversations, null, 2)
  );

  console.log(
    `Processed ${conversations.length} conversations:\n` +
      `- Removed ${conversations.length - cleanedConversations.length} empty conversations\n` +
      `- Found ${totalDuplicatesRemoved} duplicate messages across ${cleanedConversations.length} conversations\n`
  );
} catch (error) {
  console.error("Error processing conversations:", error instanceof Error ? error.message : error);
  process.exit(1);
}
